import AdminPage from "@/pages/AdminPage";
import Login from "@/pages/Login";

import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login/>,
    },
    {
        path: "/AdminPage",
        element:<AdminPage/>,
    },

]);

export default router;