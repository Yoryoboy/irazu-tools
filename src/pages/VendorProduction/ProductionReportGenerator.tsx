import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Vendor } from "../../types/Vendor";
import { ExtractedTaskFieldValues, TaskRow } from "../../types/Task";

interface Props {
  vendor: Vendor;
  tasks: ExtractedTaskFieldValues[] | TaskRow[];
}

function ProductionReportGenerator({ vendor, tasks }: Props) {
  const startingRow = 11; // Fila inicial parametrizable

  const handleDownload = async () => {
    try {
      const protectedSheetName = vendor.protectedSheetName ?? "Datos";
      // 1. Cargar el template desde public
      const response = await fetch(`/${vendor.reportTemplatePath}`);
      const buffer = await response.arrayBuffer();
      const templateProtection = await extractTemplateProtection(
        buffer,
        protectedSheetName
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      // 2. Acceder a la hoja llamada "Invoice"
      const worksheet = workbook.getWorksheet("Invoice");
      if (!worksheet) throw new Error("La hoja 'Invoice' no fue encontrada.");

      // 3. Insertar la fecha en la celda B7
      worksheet.getCell("B7").value = new Date().toLocaleDateString();

      // 4. Llenar datos desde la fila inicial
      tasks.forEach((task, index) => {
        const row = worksheet.getRow(startingRow + index);
        row.getCell(3).value =
          typeof task.projectCode === "string" ? task.projectCode : ""; // Columna C
        row.getCell(4).value =
          typeof task.quantity === "string" ? parseFloat(task.quantity) : 0; // Columna D
        row.getCell(6).value =
          typeof task.receivedDate === "string" ? task.receivedDate : ""; // Columna F
        row.getCell(7).value =
          typeof task.completionDate === "string" ? task.completionDate : ""; // Columna G
        row.getCell(8).value = typeof task.name === "string" ? task.name : ""; // Columna H
        row.commit(); // Confirma los cambios en la fila
      });

      // 5. Exportar el archivo Excel con los cambios
      const bufferOut = await workbook.xlsx.writeBuffer();
      const protectedBuffer = await applyWorkbookProtection(
        bufferOut,
        protectedSheetName,
        templateProtection,
        "moyano1"
      );
      saveAs(
        new Blob([protectedBuffer]),
        `Production_Report_${vendor.username}.xlsx`
      );
    } catch (error) {
      console.error("Error generating the Excel file:", error);
    }
  };

  return (
    <div>
      <Button
        type="primary"
        shape="round"
        icon={<DownloadOutlined />}
        size="large"
        onClick={handleDownload}
      >
        Download
      </Button>
    </div>
  );
}

export default ProductionReportGenerator;

async function applyWorkbookProtection(
  buffer: ArrayBuffer,
  sheetName: string,
  templateProtection: TemplateProtection,
  password: string
) {
  try {
    const zip = await JSZip.loadAsync(buffer);

    const relationshipsPath = "xl/_rels/workbook.xml.rels";
    const workbookPath = "xl/workbook.xml";

    const workbookXml = await zip.file(workbookPath)?.async("text");
    const relationshipsXml = await zip.file(relationshipsPath)?.async("text");

    if (!workbookXml || !relationshipsXml) {
      return buffer;
    }

    const parser = new DOMParser();
    const workbookDoc = parser.parseFromString(workbookXml, "application/xml");
    const relationshipsDoc = parser.parseFromString(
      relationshipsXml,
      "application/xml"
    );

    const sheets = workbookDoc.getElementsByTagName("sheet");
    let targetRelationshipId: string | null = null;

    for (let i = 0; i < sheets.length; i += 1) {
      const sheet = sheets.item(i);
      if (sheet?.getAttribute("name") === sheetName) {
        sheet.setAttribute("state", "veryHidden");
        targetRelationshipId = sheet.getAttribute("r:id");
        break;
      }
    }

    applyWorkbookStructureProtection(workbookDoc, templateProtection, password);

    if (!targetRelationshipId) {
      const serializer = new XMLSerializer();
      zip.file(workbookPath, serializer.serializeToString(workbookDoc));
      return zip.generateAsync({ type: "arraybuffer" });
    }

    const targetRelationship = Array.from(
      relationshipsDoc.getElementsByTagName("Relationship")
    ).find((rel) => rel.getAttribute("Id") === targetRelationshipId);

    if (!targetRelationship) {
      const serializer = new XMLSerializer();
      zip.file(workbookPath, serializer.serializeToString(workbookDoc));
      return zip.generateAsync({ type: "arraybuffer" });
    }

    const sheetPath = `xl/${targetRelationship.getAttribute("Target")}`;
    const sheetXml = await zip.file(sheetPath)?.async("text");
    if (sheetXml) {
      const sheetDoc = parser.parseFromString(sheetXml, "application/xml");
      applyWorksheetProtection(sheetDoc, templateProtection, password);
      const sheetSerializer = new XMLSerializer();
      zip.file(sheetPath, sheetSerializer.serializeToString(sheetDoc));
    }

    const serializer = new XMLSerializer();
    zip.file(workbookPath, serializer.serializeToString(workbookDoc));
    zip.file(
      relationshipsPath,
      serializer.serializeToString(relationshipsDoc)
    );

    return await zip.generateAsync({ type: "arraybuffer" });
  } catch (error) {
    console.error("Error applying workbook protection:", error);
    return buffer;
  }
}

function applyWorkbookStructureProtection(
  workbookDoc: Document,
  templateProtection: TemplateProtection,
  password: string
) {
  const workbookRoot = workbookDoc.documentElement;
  const existing = workbookDoc.getElementsByTagName("workbookProtection").item(0);

  const namespace =
    workbookDoc.documentElement.namespaceURI ||
    "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const protectionElement =
    existing ?? workbookDoc.createElementNS(namespace, "workbookProtection");

  while (protectionElement.attributes.length > 0) {
    protectionElement.removeAttribute(protectionElement.attributes[0].name);
  }

  const attributes = templateProtection.workbookProtectionAttributes;
  if (attributes) {
    attributes.forEach((value, key) => {
      protectionElement.setAttribute(key, value);
    });
  } else {
    protectionElement.setAttribute("workbookPassword", hashExcelPassword(password));
  }
  if (!protectionElement.getAttribute("lockStructure")) {
    protectionElement.setAttribute("lockStructure", "1");
  }

  if (!existing) {
    const bookViewsElement = workbookDoc.getElementsByTagName("bookViews").item(0);
    const sheetsElement = workbookDoc.getElementsByTagName("sheets").item(0);
    if (bookViewsElement) {
      workbookRoot.insertBefore(protectionElement, bookViewsElement);
    } else if (sheetsElement) {
      workbookRoot.insertBefore(protectionElement, sheetsElement);
    } else {
      workbookRoot.appendChild(protectionElement);
    }
  }
}

function applyWorksheetProtection(
  sheetDoc: Document,
  templateProtection: TemplateProtection,
  password: string
) {
  const worksheetRoot = sheetDoc.documentElement;
  const existing = sheetDoc.getElementsByTagName("sheetProtection").item(0);

  const namespace =
    sheetDoc.documentElement.namespaceURI ||
    "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const protectionElement =
    existing ?? sheetDoc.createElementNS(namespace, "sheetProtection");

  while (protectionElement.attributes.length > 0) {
    protectionElement.removeAttribute(protectionElement.attributes[0].name);
  }

  const attributes = templateProtection.sheetProtectionAttributes;
  if (attributes) {
    attributes.forEach((value, key) => {
      protectionElement.setAttribute(key, value);
    });
  } else {
    protectionElement.setAttribute("password", hashExcelPassword(password));
    protectionElement.setAttribute("sheet", "1");
    protectionElement.setAttribute("objects", "1");
    protectionElement.setAttribute("scenarios", "1");
  }

  if (!existing) {
    const sheetData = worksheetRoot.getElementsByTagName("sheetData").item(0);
    if (sheetData) {
      worksheetRoot.insertBefore(protectionElement, sheetData);
    } else {
      worksheetRoot.appendChild(protectionElement);
    }
  }
}

function hashExcelPassword(password: string) {
  let hash = 0;
  if (password.length === 0) {
    return "";
  }

  for (let i = password.length - 1; i >= 0; i -= 1) {
    const charCode = password.charCodeAt(i);
    hash = ((hash >> 14) & 0x01) | ((hash << 1) & 0x7fff);
    hash ^= charCode;
  }

  hash = ((hash >> 14) & 0x01) | ((hash << 1) & 0x7fff);
  hash ^= password.length;
  hash ^= 0x8000;
  hash &= 0x7fff;

  const hex = hash.toString(16).toUpperCase();
  return hex.padStart(4, "0");
}

type TemplateProtection = {
  workbookProtectionAttributes?: Map<string, string>;
  sheetProtectionAttributes?: Map<string, string>;
};

async function extractTemplateProtection(
  buffer: ArrayBuffer,
  sheetName: string
): Promise<TemplateProtection> {
  try {
    const templateZip = await JSZip.loadAsync(buffer);
    const workbookPath = "xl/workbook.xml";
    const relationshipsPath = "xl/_rels/workbook.xml.rels";

    const workbookXml = await templateZip.file(workbookPath)?.async("text");
    const relationshipsXml = await templateZip.file(relationshipsPath)?.async("text");
    if (!workbookXml || !relationshipsXml) {
      return {};
    }

    const parser = new DOMParser();
    const workbookDoc = parser.parseFromString(workbookXml, "application/xml");
    const relationshipsDoc = parser.parseFromString(
      relationshipsXml,
      "application/xml"
    );

    const workbookProtectionElement =
      workbookDoc.getElementsByTagName("workbookProtection").item(0);
    const workbookAttrs = new Map<string, string>();
    if (workbookProtectionElement) {
      Array.from(workbookProtectionElement.attributes).forEach((attr) => {
        workbookAttrs.set(attr.name, attr.value);
      });
    }

    const sheets = workbookDoc.getElementsByTagName("sheet");
    let targetRelationshipId: string | null = null;
    for (let i = 0; i < sheets.length; i += 1) {
      const sheet = sheets.item(i);
      if (sheet?.getAttribute("name") === sheetName) {
        targetRelationshipId = sheet.getAttribute("r:id");
        break;
      }
    }

    const targetRelationship = Array.from(
      relationshipsDoc.getElementsByTagName("Relationship")
    ).find((rel) => rel.getAttribute("Id") === targetRelationshipId);

    if (!targetRelationship) {
      return {
        workbookProtectionAttributes: workbookAttrs.size ? workbookAttrs : undefined,
      };
    }

    const sheetPath = `xl/${targetRelationship.getAttribute("Target")}`;
    const sheetXml = await templateZip.file(sheetPath)?.async("text");
    if (!sheetXml) {
      return {
        workbookProtectionAttributes: workbookAttrs.size ? workbookAttrs : undefined,
      };
    }

    const sheetDoc = parser.parseFromString(sheetXml, "application/xml");
    const sheetProtectionElement =
      sheetDoc.getElementsByTagName("sheetProtection").item(0);
    const sheetAttrs = new Map<string, string>();
    if (sheetProtectionElement) {
      Array.from(sheetProtectionElement.attributes).forEach((attr) => {
        sheetAttrs.set(attr.name, attr.value);
      });
    }

    return {
      workbookProtectionAttributes: workbookAttrs.size ? workbookAttrs : undefined,
      sheetProtectionAttributes: sheetAttrs.size ? sheetAttrs : undefined,
    };
  } catch (error) {
    console.error("Error extracting template protection:", error);
    return {};
  }
}
