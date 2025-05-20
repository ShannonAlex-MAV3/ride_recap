import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import React from "react";

const routes = [
  { path: "/", breadcrumb: "Dashboard" },
  { path: "/home", breadcrumb: "Home" },
  { path: "/auto-care", breadcrumb: "Auto Care" },
  { path: "/users", breadcrumb: "Users" },
  { path: "/job-config", breadcrumb: "Job Config" },
  { path: "/job-config/new", breadcrumb: "New Job" },
  { path: "/job-config/:jobID", breadcrumb: "Edit Job" },
  { path: "/customer", breadcrumb: "Customer" },
  { path: "/customer/new", breadcrumb: "New Customer" },
  { path: "/customer/:customerID", breadcrumb: "Edit Customer" },
];

export const CustomBreadCrumb = () => {
  const location = useLocation();
  const { hash, pathname, search } = location;

  const pathSegments = pathname.split("/").filter(Boolean); // removes empty strings

  let fullPath = ""; // will accumulate full paths like /customer, /customer/new

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.map((segment, index) => {
          fullPath += `/${segment}`;

          const matchingRoute = routes.find((route) => {
            // Convert route path like '/customer/:id' to '/customer/new' using regex
            const pattern = "^" + route.path.replace(/:\w+/g, "[^/]+") + "$";
            const regex = new RegExp(pattern);
            return regex.test(fullPath);
          });

          if (!matchingRoute) return null;

          const isLast = index === pathSegments.length - 1;

          return (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <span>{matchingRoute.breadcrumb}</span>
                ) : (
                  <BreadcrumbLink href={fullPath}>
                    {matchingRoute.breadcrumb}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
