import "./App.css";
import { TableVirtuoso } from "react-virtuoso";
import Switch from "./components/Switch";
import { useEffect, useState } from "react";
import { Pencil, Check, Trash, X } from "lucide-react";
import { flightDB } from "./db";
import { Skeleton } from "./components/Skeleton";
import toast, { Toaster } from "react-hot-toast";

const App = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedFields, setEditedFeilds] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    flightDB
      .getAllFlights()
      .then((data) => {
        setData(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const deleteHandler = (index) => {
    setEditRowIndex(null);
    const oldData = {
      rowIndex: index,
      rowData: data[index],
    };
    setData((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    flightDB
      .deleteFlight(index)
      .then((res) => {
        // toast.success("Record updated");
      })
      .catch((error) => {
        toast.error("Failed to delete the record");
        setData((prev) => {
          const copy = [...prev];
          copy.splice(oldData.rowIndex, 0, oldData.rowData);
          return copy;
        });
      });
  };

  const editHandler = (index, item) => {
    setEditRowIndex(index);
    setEditedFeilds({
      std: item.std,
      sta: item.sta,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
    });
  };

  const valueChangeHandler = ({ value, name }) => {
    setEditedFeilds((prev) => ({ ...prev, [name]: value }));
  };

  const cancelHandler = () => {
    setEditRowIndex(null);
  };

  const saveHandler = () => {
    const rowData = data[editRowIndex];
    const changedData = {};
    for (const key in editedFields) {
      if (!Object.hasOwn(editedFields, key)) continue;

      if (editedFields[key] !== rowData[key]) {
        changedData[key] = editedFields[key];
      }
    }
    if (!Object.keys(changedData).length) {
      setEditRowIndex(null);
      toast.success("Record updated");
      return;
    }
    console.log(changedData);
    const oldData = {
      rowIndex: editRowIndex,
      rowData: data[editRowIndex],
    };
    setData((prev) => {
      const copy = [...prev];
      copy[editRowIndex] = { ...copy[editRowIndex], ...changedData };
      return copy;
    });
    setSaveLoading(true);
    flightDB
      .saveFlightDetails(editRowIndex, changedData)
      .then((res) => {
        toast.success("Record updated");
      })
      .catch((error) => {
        toast.error("unable to save the record");
        setData((prev) => {
          const copy = [...prev];
          copy[oldData.rowIndex] = { ...oldData.rowData };
          return copy;
        });
      })
      .finally(() => {
        setSaveLoading(false);
        setEditRowIndex(null);
      });
  };

  const statusChangeHandler = (status, index) => {
    console.log(status, index);
    const oldData = {
      rowIndex: index,
      rowData: data[index],
    };
    setData((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        status: status ? "Active" : "Inactive",
      };
      return copy;
    });
    flightDB
      .saveFlightDetails(index, status)
      .then((res) => {
        // toast.success("Record updated");
      })
      .catch((error) => {
        toast.error("Failed to save the record");
        setData((prev) => {
          const copy = [...prev];
          copy[oldData.rowIndex] = { ...oldData.rowData };
          return copy;
        });
      });
  };

  const selectHandler = (e, index) => {
    if (e.target.checked) {
      setSelectedIndex((prev) => [...prev, index]);
    } else {
      setSelectedIndex((prev) => {
        return prev.filter((v) => v !== index);
      });
    }
  };

  const multiDeleteHandler = () => {
    setData((prev) => {
      return prev.filter((_, i) => !selectedIndex.includes(i));
    });
    setSelectedIndex([]);
  };

  return (
    <div className="my-container">
      <div className="flex gap-1 mb-2 ">
        <input
          type="search"
          placeholder="Search flights"
          className="rounded border outline-0 focus:outline-1"
        />
        <input
          type="date"
          placeholder="Start date"
          className="border rounded bg-white"
        />
        <input
          type="date"
          placeholder="End date"
          className="border rounded bg-white"
        />
        <Switch
        // status={item.status === "Active"}
        // onChange={(status) => statusChangeHandler(status, index)}
        />
        {!!selectedIndex.length && (
          <button
            className="bg-red-400 px-1.5 rounded text-white"
            onClick={multiDeleteHandler}
          >
            Delete
          </button>
        )}
      </div>

      <div
        style={{ height: "500px" }}
        className="border rounded-lg overflow-hidden shadow "
      >
        <TableVirtuoso
          data={data}
          fixedHeaderContent={() => (
            <tr className="border bg-gray-400 py-5">
              <th></th>
              <th>Id</th>
              <th title="airline operating code">AOC</th>
              <th>Flight No.</th>
              <th>Origin/Dest</th>
              <th>STD </th>
              <th>STA </th>
              <th>Date Of Operation</th>
              <th>Body Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          )}
          itemContent={(index, item) => (
            <>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIndex.includes(index)}
                  onChange={(e) => selectHandler(e, index)}
                />
              </td>
              <td>{item.id}</td>
              <td>{item.aoc}</td>
              <td>{item.flightNumber}</td>
              <td>
                {item.origin} → {item.destination}
              </td>
              <td>
                {editRowIndex === index ? (
                  <input
                    name="std"
                    type="time"
                    value={editedFields.std}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                  />
                ) : (
                  item.std
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <input
                    type="time"
                    name="sta"
                    value={editedFields.sta}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                  />
                ) : (
                  item.sta
                )}
              </td>
              <td>{item.daysOfOperation}</td>
              <td>{item.bodyType.split("_")[0]}</td>
              <td>
                {editRowIndex === index ? (
                  <input
                    type="date"
                    name="startDate"
                    value={editedFields.startDate}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                  />
                ) : (
                  item.startDate
                )}
              </td>
              <td>
                {editRowIndex === index ? (
                  <input
                    type="date"
                    name="endDate"
                    value={editedFields.endDate}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                  />
                ) : (
                  item.endDate
                )}
              </td>
              <td>
                <Switch
                  status={item.status === "Active"}
                  onChange={(status) => statusChangeHandler(status, index)}
                />
                {/* {editRowIndex === index ? (
                  <select
                    value={editedFields.status}
                    name="status"
                    className="rounded shadow"
                    onChange={(e) => valueChangeHandler(e.target)}
                    className="border rounded bg-white"
                    disabled={saveLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  item.status
                )} */}
              </td>
              <td>
                <div className="w-fit text-center flex justify-center p-1 my-2 border rounded">
                  {editRowIndex === index ? (
                    <div className=" text-center flex justify-center items-center">
                      {saveLoading ? (
                        <div className="w-4 h-4 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                      ) : (
                        <Check
                          type="button"
                          title="save"
                          className="w-4 h-4 text-green-700 cursor-pointer"
                          onClick={saveHandler}
                        />
                      )}
                      <X
                        type="button"
                        title="cancel"
                        className="w-5 h-5 text-red-500"
                        onClick={cancelHandler}
                      />
                    </div>
                  ) : (
                    <Pencil
                      type="button"
                      title="edit"
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                      onClick={() => editHandler(index, item)}
                    />
                  )}
                  <Trash
                    type="button"
                    title="delete"
                    className="w-4 h-4 text-blue-500 cursor-pointer"
                    onClick={() => deleteHandler(index)}
                  />
                </div>
              </td>
            </>
          )}
          // styling
          components={{
            Table: (props) => (
              <table {...props} className="w-full border-collapse" />
            ),
            TableRow: (props) => {
              const rowIndex = props["data-index"];

              return (
                <tr
                  {...props}
                  className={`border-b transition cursor-pointer text-center ${
                    rowIndex === editRowIndex
                      ? "bg-gray-300"
                      : "hover:bg-gray-300"
                  }`}
                />
              );
            },
            TableCell: (props) => (
              <td {...props} className="py-4 text-center" />
            ),
            EmptyPlaceholder: () => (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </>
            ),
          }}
          style={{ width: "100%" }}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default App;
