"use client"
import { FaPlus } from "react-icons/fa";

const HeaderSection = ({ setIsAddDataFormOpen }) => {
  return (
    <div className="bg-white z-30 border-2 border-gray-200 w-fit mt-2 shadow-sm rounded-xl px-6 py-3">
      <div className="flex items-center justify-left space-x-4">
        <button
          onClick={() => setIsAddDataFormOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaPlus className="mr-2 text-lg" /> Add Contact
        </button>
        {/* Campaign button - keeping commented for reference */}
        {/* <Link href="">
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200">
            <FaVenusMars className="mr-2 text-lg" /> Campaign
          </button>
        </Link> */}
      </div>
    </div>
  );
};

export default HeaderSection;
