"use client";

import { useState } from "react";
import {
  FaGlobe,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaSearch,
  FaTimes,
  FaUser,
  FaUserCog,
} from "react-icons/fa";
import { useToast } from "@/app/component/customtoast/page";

const DataFromGPlaceApi = ({ setShow, userID }) => {
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const { addToast } = useToast();

  const getData = async () => {
    if (!limit) {
      return addToast("Select a limit", "warning");
    }
    if (!query) {
      return addToast("Enter query", "warning");
    } else if (query.length < 5) {
      return addToast("Enter at least 5 letters", "warning");
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/data-extraction/google-map/get-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword: query, limit: Number(limit) }),
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.data &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        setData(data.data);
      } else {
        addToast("Data not found, please enter valid keywords", "error");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setQuery("");
      setLoading(false);
    }
  };

  const handleSave = async (item) => {
    if (!item.phone || item.phone === "N/A") {
      return addToast("This data don't have phone number", "error");
    }

    const payload = {
      name: item.name,
      mobile: item.phone,
      address: item.address,
      datatype: "B",
      website: item.website,
      pincode: item.pincode,
      userID: userID,
    };

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/data-extraction/google-map/save-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
      } else {
        addToast(data.message, "warning");
      }
    } catch (error) {
      console.error(error);
      addToast("Error in adding data", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="flex flex-col space-x-2 bg-white p-16 pt-9 rounded w-[70%] h-[70%] overflow-y-scroll">
        {/* {loading && <Loader />} */}
        <div className="flex flex-row items-center text-center mb-4">
          <div className="w-full">
            <h2 className="text-xl font-semibold">Search Data</h2>
          </div>
          <div
            onClick={() => setShow(false)}
            className="my-auto font-normal border px-2 py-2 bg-red-500 text-white cursor-pointer hover:bg-red-600 hover:text-gray-500 rounded"
          >
            <FaTimes />
          </div>
        </div>

        <div className="flex justify-center items-center mt-4">
          <select
            name="limit"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-24 py-2 mr-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Limit</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="80">80</option>
            <option value="100">100</option>
          </select>

          <div className="relative flex items-center w-[80%] rounded">
            <FaSearch className="absolute left-4 text-gray-500 text-lg" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keyword With Location"
              className="w-full py-2 pl-12 pr-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  getData();
                }
              }}
            />
            <button
              onClick={getData}
              className="bg-blue-500 text-white px-4 py-2 w-max rounded ml-2 hover:bg-blue-600 transition duration-300"
            >
              Search
            </button>
          </div>
        </div>

        {data.length > 0 && (
          <div className="flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-700">Show</label>
                <select className="border rounded px-2 py-1">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-gray-700">records</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <table className="w-full text-sm text-left border-spacing-x-4">
                <thead>
                  <tr className="text-gray-600 top-0 bg-white z-10">
                    <th className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FaUserCog className="text-blue-600 w-4 h-4" />
                        <span>Actions</span>
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-blue-600 w-4 h-4" />
                        <span>Name</span>
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-yellow-600 w-4 h-4" />
                        <span>Phone</span>
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-green-600 w-4 h-4" />
                        <span>Address</span>
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-yellow-600 w-4 h-4" />
                        <span>Pincode</span>
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FaGlobe className="text-yellow-600 w-4 h-4" />
                        <span>Website</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            title="Save"
                            className="p-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition"
                            onClick={() => handleSave(item)}
                          >
                            <FaSave className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 w-[140px]">
                        <div className="flex">
                          <span>{item.phone}</span>
                        </div>
                      </td>
                      <td className="px-8 py-2">
                        <div className="flex flex-col space-y-1">
                          <p className="text-xs text-black">{item.address}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.pincode}</td>
                      <td className="px-4 py-3">
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          visit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFromGPlaceApi;
