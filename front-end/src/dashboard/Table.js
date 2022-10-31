import { unseatTable } from "../utils/api";
import { useHistory } from "react-router-dom";

function Table({ table }) {
  const history = useHistory();
  function clickHandler() {
    if (window.confirm("Is this table ready to seat new guests?")) {
      const abortController = new AbortController();
      unseatTable(table.table_id, abortController.signal)
        .then(() => history.go(0))
        .catch((error) => console.log("error", error));
      return () => abortController.abort();
    }
  }

  return (
    <div className="card">
    <h5 className="card-header">Table Name: {table.table_name}</h5>
    <div className="card-body">
      <h5 className="card-title">Capacity: {table.capacity}</h5>
        {table.reservation_id ? (
          <>
            <button
              onClick={clickHandler}
              className="btn btn-primary"
              data-table-id-finish={table.table_id}
            >
              Finish
            </button>
            <p data-table-id-status={table.table_id}>Occupied</p>
          </>
        ) : (
          <p data-table-id-status={table.table_id}>Free</p>
        )}
      </div>
    </div>
  );
}

export default Table;