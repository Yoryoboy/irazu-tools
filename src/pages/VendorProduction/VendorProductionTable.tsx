import { Task } from "../../types";
import { extractTaskFields } from "../../utils/helperFunctions";
import { asbuiltFields, designFields } from "./VendorProductionTable.config";

interface Props {
  asbuilts: Task[];
  designs: Task[];
}

function VendorProductionTable({ asbuilts, designs }: Props) {
  const asbuiltFieldsValues = asbuilts.map((asbuilt) => {
    const projectCode = "CCI - HS ASBUILT";
    const fieldsValues = extractTaskFields(asbuilt, asbuiltFields);
    return { ...fieldsValues, projectCode };
  });
  const designFieldsValues = designs.map((design) => {
    const projectCode = "CCI - HS DESIGN";
    const fieldValues = extractTaskFields(design, designFields);
    return { ...fieldValues, projectCode };
  });

  console.log(asbuiltFieldsValues, designFieldsValues);

  return (
    <div>
      <h1>Asbuilts for Anais Del Valle Archila Gonzalez</h1>
      {asbuilts.map((asbuilt) => (
        <div style={{ lineHeight: "1.5" }} key={asbuilt.id}>
          <h2>{asbuilt.name}</h2>
          <p>{asbuilt.description}</p>
        </div>
      ))}
      <h1>Designs for Anais Del Valle Archila Gonzalez</h1>
      {designs.map((design) => (
        <div style={{ lineHeight: "1.5" }} key={design.id}>
          <h2>{design.name}</h2>
          <p>{design.description}</p>
        </div>
      ))}
    </div>
  );
}

export default VendorProductionTable;
