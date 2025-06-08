import React from "react";
import { Link } from "react-router-dom";

const BummerPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Oops!</h1>
      <p className="text-xl mb-8">
        You need to start an exam before you can see the results.
      </p>
      <Link
        to="/home"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Start Exam
      </Link>
    </div>
  );
};

export default BummerPage;
