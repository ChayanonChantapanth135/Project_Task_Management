import React from "react";
import Header from "../components/Header";
import Footer from "../components/footer";

const AllTasks = () => {
  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto mt-4">
        <h1>AllTasks</h1>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded block mx-auto"
        onClick={() => alert("คลิกปุ่มสำเร็จ!")}
      >
        คลิกฉัน
      </button>
      <Footer />
    </div>
  );
};

export default AllTasks;
