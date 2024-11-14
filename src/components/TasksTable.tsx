import { MQMSTask } from "../types";
import styles from "./TasksTable.module.css";

interface Props {
  data: MQMSTask[];
  renderAdditionalColumns?: (row: MQMSTask) => JSX.Element;
}

function TasksTable({ data, renderAdditionalColumns }: Props) {
  return (
    <section style={styles}>
      {data.length > 0 && (
        <>
          <h1>Lista de trabajos de MQMS</h1>
          <table className="table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => {
                  if (key !== "REQUEST_ID") return <th key={key}>{key}</th>;
                })}
                {renderAdditionalColumns && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                return (
                  <tr key={row.EXTERNAL_ID}>
                    <td>{row.JOB_NAME}</td>
                    <td>{row.EXTERNAL_ID}</td>
                    <td>{row.SECONDARY_EXTERNAL_ID}</td>
                    <td>{row.REQUEST_NAME}</td>
                    <td>{row.PROJECT_TYPE}</td>
                    {renderAdditionalColumns && (
                      <td>{renderAdditionalColumns(row)}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

export default TasksTable;
