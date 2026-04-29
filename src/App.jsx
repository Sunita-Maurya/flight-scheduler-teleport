import "./App.css";
import { TableVirtuoso } from "react-virtuoso";
import Switch from "./components/Switch";
import { useEffect, useState } from "react";
import { Pencil, Check, Trash, X } from "lucide-react";
import { flightDB } from "./db";
import { Skeleton } from "./components/Skeleton";
import toast, { Toaster } from "react-hot-toast";
import MultiSelect from "./components/MultiSelect";
import DropDown from "./components/DropDown";

const App = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editedFields, setEditedFeilds] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedId, setSelectedId] = useState([]);
  const [filter, setFilter] = useState({});
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setIsLoading(true);
    flightDB
      .getAllFlights()
      .then((data) => {
        setData(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    applyFilter();
  }, [data, filter]);

  useEffect(() => {
    const id = setTimeout(() => {
      setFilter((prev) => ({ ...prev, search: searchValue }));
    }, 500);

    return () => clearTimeout(id);
  }, [searchValue]);

  const deleteHandler = (id) => {
    const index = data.findIndex((d) => d.id === id);
    if (index === -1) return;
    setEditRowId(null);
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
      .deleteFlight(id)
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

  const editHandler = (item) => {
    setEditRowId(item.id);
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

  const cancelEditHandler = () => {
    setEditRowId(null);
  };

  const saveHandler = () => {
    const index = data.findIndex((d) => d.id === editRowId);
    if (index === -1) return;
    const rowData = data[index];
    const changedData = {};
    for (const key in editedFields) {
      if (!Object.hasOwn(editedFields, key)) continue;

      if (editedFields[key] !== rowData[key]) {
        changedData[key] = editedFields[key];
      }
    }
    if (!Object.keys(changedData).length) {
      setEditRowId(null);
      toast.success("Record updated");
      return;
    }
    const oldData = {
      rowIndex: index,
      rowData: data[index],
    };
    setData((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...changedData };
      return copy;
    });
    setSaveLoading(true);
    flightDB
      .saveFlightDetails(editRowId, changedData)
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
        setEditRowId(null);
      });
  };

  const statusChangeHandler = (status, id) => {
    const index = data.findIndex((d) => d.id === id);
    if (index === -1) return;
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
      .saveFlightDetails(id, status)
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

  const selectHandler = (e, id) => {
    if (e.target.checked) {
      setSelectedId((prev) => [...prev, id]);
    } else {
      setSelectedId((prev) => {
        return prev.filter((v) => v !== id);
      });
    }
  };

  const multiDeleteHandler = () => {
    setData((prev) => {
      return prev.filter((v, i) => !selectedId.includes(v.id));
    });
    setSelectedId([]);
  };

  const filterChanggeHandler = ({ target }) => {
    const { name, value } = target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };
  const applyFilter = () => {
    cancelEditHandler();
    console.log("apply filter");

    console.log(filter, data);
    const newFilteredData = data.filter((row) => {
      if (filter.aoc && row.aoc !== filter.aoc) return false;
      if (filter.status && row.status !== filter.status) return false;
      if (filter.bodyType && row.bodyType !== filter.bodyType) return false;
      if (filter.startDate && row.startDate !== filter.startDate) return false;
      if (filter.endDate && row.endDate !== filter.endDate) return false;
      if (filter.daysOfOperation && filter.daysOfOperation.length) {
        const isAnyDayFound = filter.daysOfOperation.some((dayNum) => {
          return row.daysOfOperation.includes(dayNum);
        });
        if (!isAnyDayFound) return false;
      }

      if (filter.search) {
        const anyMatch =
          row.flightNumber.includes(filter.search) ||
          row.origin.toLowerCase().includes(filter.search.toLowerCase()) ||
          row.destination.toLowerCase().includes(filter.search.toLowerCase());

        if (!anyMatch) return false;
      }

      return true;
    });
    setFilteredData(newFilteredData);
  };

  const clearFilter = () => {
    setFilter({});
    //  startDate: null, // yyyy-mm-dd
    // endDate: null, // yyyy-mm-dd
    // daysOfOperation: null, //"1234567"
    // status: null, // Active, Inactive
    // aoc: null, // ['Z2', 'D7', 'AK', 'FD', 'QZ']
    // bodyType: null,
  };

  return (
    <div className="my-container">
      <h2 className="my-5 font-bold text-2xl">
        Flight Scheduler Demo- Sunita Maurya
      </h2>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-1">
          <DropDown
            placeholder="Select AOC"
            name="aoc"
            value={filter.aoc}
            options={["Z2", "D7", "AK", "FD", "QZ"]}
            className="rounded border outline-0 focus:outline-1 h-8"
            onChange={filterChanggeHandler}
          />
          <input
            type="date"
            name="startDate"
            value={filter.startDate || ""}
            placeholder="Start date"
            className="border rounded bg-white h-8"
            onChange={filterChanggeHandler}
          />
          <input
            type="date"
            name="endDate"
            value={filter.endDate || ""}
            placeholder="End date"
            onChange={filterChanggeHandler}
            className="border rounded bg-white h-8"
          />
          <MultiSelect
            name="daysOfOperation"
            selected={filter.daysOfOperation || []}
            onChange={(name, value) => {
              setFilter((prev) => ({ ...prev, [name]: value }));
            }}
          />
          <DropDown
            placeholder="Select Status"
            name="status"
            value={filter.status}
            options={["Active", "Inactive"]}
            className="rounded border outline-0 focus:outline-1 h-8"
            onChange={filterChanggeHandler}
          />
          <DropDown
            placeholder="Body type"
            name="bodyType"
            value={filter.bodyType}
            options={[
              { value: "narrow_body", label: "narrow" },
              { value: "wide_body", label: "wide" },
            ]}
            className="rounded border outline-0 focus:outline-1 h-8"
            onChange={filterChanggeHandler}
          />

          {/* <button
            className="bg-blue-400 px-1.5 rounded text-white"
            onClick={applyFilter}
          >
            Apply Filter
          </button> */}
          <button
            className="bg-gray-500 px-1.5 rounded text-white"
            onClick={clearFilter}
          >
            Clear Filter
          </button>
          {!!selectedId.length && (
            <button
              className="bg-red-400 px-1.5 rounded text-white"
              onClick={multiDeleteHandler}
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <input
            type="search"
            placeholder="Search flights"
            value={searchValue}
            className="rounded border outline-0 focus:outline-1 h-8"
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>
      <div
        style={{ height: "500px" }}
        className="border rounded-lg overflow-hidden shadow "
      >
        <TableVirtuoso
          data={filteredData}
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
                  checked={selectedId?.includes(item?.id)}
                  onChange={(e) => selectHandler(e, item.id)}
                />
              </td>
              <td>{item?.id}</td>
              <td>{item?.aoc}</td>
              <td>{item?.flightNumber}</td>
              <td>
                {item?.origin} → {item?.destination}
              </td>
              <td>
                {editRowId === item?.id ? (
                  <input
                    name="std"
                    type="time"
                    value={editedFields.std}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                  />
                ) : (
                  item?.std
                )}
              </td>
              <td>
                {editRowId === item?.id ? (
                  <input
                    type="time"
                    name="sta"
                    value={editedFields.sta}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                  />
                ) : (
                  item?.sta
                )}
              </td>
              <td>{item?.daysOfOperation}</td>
              <td>{item?.bodyType.split("_")[0]}</td>
              <td>
                {editRowId === item?.id ? (
                  <input
                    type="date"
                    name="startDate"
                    value={editedFields.startDate}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                    max={editedFields.endDate}
                  />
                ) : (
                  item?.startDate
                )}
              </td>
              <td>
                {editRowId === item?.id ? (
                  <input
                    type="date"
                    name="endDate"
                    value={editedFields.endDate}
                    className="border rounded bg-white"
                    onChange={(e) => valueChangeHandler(e.target)}
                    disabled={saveLoading}
                    min={editedFields.startDate}
                  />
                ) : (
                  item?.endDate
                )}
              </td>
              <td>
                <Switch
                  status={item?.status === "Active"}
                  onChange={(status) => statusChangeHandler(status, item?.id)}
                />
              </td>
              <td>
                <div className="w-fit text-center flex justify-center p-1 my-2 border rounded">
                  {editRowId === item?.id ? (
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
                        onClick={cancelEditHandler}
                      />
                    </div>
                  ) : (
                    <Pencil
                      type="button"
                      title="edit"
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                      onClick={() => editHandler(item)}
                    />
                  )}
                  <Trash
                    type="button"
                    title="delete"
                    className="w-4 h-4 text-blue-500 cursor-pointer"
                    onClick={() => deleteHandler(item.id)}
                  />
                </div>
              </td>
            </>
          )}
          // for comp styling..
          components={{
            Table: (props) => (
              <table {...props} className="w-full border-collapse" />
            ),
            TableBody: (props) => <tbody {...props} />,
            TableRow: (props) => {
              const rowIndex = props["data-index"];
              const item = data[rowIndex];
              return (
                <tr
                  {...props}
                  className={`border-b transition cursor-pointer text-center ${
                    item?.id === editRowId ? "bg-gray-300" : "hover:bg-gray-300"
                  }`}
                />
              );
            },
            TableCell: (props) => (
              <td {...props} className="py-4 text-center" />
            ),
            EmptyPlaceholder: () => (
              <>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)
                ) : (
                  <tr>
                    <td colSpan={12} className="text-center p-5 text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
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
