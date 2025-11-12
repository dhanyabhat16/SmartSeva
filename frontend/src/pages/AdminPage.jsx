import React from "react";
import { Link } from "react-router-dom";

const AdminPage = () => {
  const services = [
    { name: "Manage Admins", path: "/manage-admin", img: "/admin.jpg" },
    { name: "Manage Routes", path: "/manage-route", img: "/routes.jpg" },
    { name: "Manage Buses", path: "/manage-buses", img: "/buses.jpg" },
    { name: "Manage Stops", path: "/manage-stops", img: "/stops.jpg" },
    { name: "Manage Bus Scheduling", path: "/manage-busSchedule", img: "/bus-schedule.png" },
    { name: "Check Earnings", path: "/paymentsHist", img: "/pay.png" },
  ];

  // Determine grid columns based on number of services
  let gridCols = "grid-cols-1";
  if (services.length === 2) gridCols = "grid-cols-2 justify-items-center";
  else if (services.length === 3) gridCols = "grid-cols-3";
  else if (services.length <= 4) gridCols = "grid-cols-2";
  else gridCols = "grid-cols-3";

  return (
    <div className="py-12 px-4 min-h-screen bg-base-200">
      <h1 className="text-3xl font-bold mb-10 text-center text-base-content">
        Admin Dashboard
      </h1>
      <div className={`grid ${gridCols} gap-8 justify-items-center`}>
        {services.map((service) => (
          <div
            key={service.name}
            className="card bg-base-100 border border-base-300 w-80 rounded-xl shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary hover:z-10 group"
          >
            <figure className="px-3 pt-4">
              <img
                src={service.img}
                alt={service.name}
                className="rounded-xl object-contain h-36 w-full transition-opacity duration-150 group-hover:opacity-90"
              />
            </figure>
            <div className="card-body items-center text-center">
              <div className="card-actions mt-2">
                <Link
                  to={service.path}
                  className="btn btn-primary rounded-full text-base-100 transition duration-200 shadow group-hover:scale-105"
                >
                  {service.name}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
