import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

import { useAuthStore } from './store/useAuthStore'
import {Loader} from "lucide-react"
import {Toaster} from "react-hot-toast"
import BookBusPage from './pages/BookBusPage'
import { useBookStore } from './store/useBookStore'
import BusResultsPage from './pages/BusResultsPage'
import BusSeatLayoutPage from './pages/BusSeatLayoutPage'
import AdminProfilePage from './pages/AdminProfilePage'
import AdminPage from './pages/AdminPage'
import ManageStops from './pages/ManageStops'
import ManageRoutes from './pages/ManageRoutes'
import ManageRouteWay from './pages/ManageRouteWay'
import ManageAdmins from './pages/ManageAdmins'
import ManageBuses from './pages/ManageBuses'
import ManageBusSchedule from './pages/ManageBusSchedule'
import PayHistoryPage from './pages/PayHistoryPage'

const App = () => {
  const {authUser,checkAuth,isCheckingAuth}=useAuthStore();
  const {srcdstbuses,selectedbus}=useBookStore();

  useEffect(()=>{
    checkAuth()
  },[checkAuth]);

  if(isCheckingAuth && !authUser)return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className='size-10 animate-spin'/>
    </div>
  )
  return (
    <div >
      <Navbar/>
      <Routes>
        <Route
  path="/"
  element={
    authUser?.role === "citizen" ? (
      <HomePage />
    ) : authUser?.role === "admin" ? (
      <Navigate to="/admin-page" />
    ) : (
      <Navigate to="/login" />
    )
  }
/>

        <Route path="/book-bus" element={authUser?.role=="citizen"?<BookBusPage/>:<Navigate to="/login"/>}/>
        <Route path="/signup" element={!authUser?<SignUpPage/>:<Navigate to="/"/>}/>
        <Route path="/login" element={!authUser?<LoginPage/>:<Navigate to="/"/>}/>
        <Route path="/profile" element={authUser?.role=="citizen"?<ProfilePage/>:<Navigate to="/"/>}/>
        <Route path="/bus-results" element={srcdstbuses?<BusResultsPage />:<Navigate to="/"/>} />
        <Route
          path="/bus/:bus_id"
          element={selectedbus ? <BusSeatLayoutPage /> : <Navigate to="/bus-results" />}
        />
      <Route path="/adminProfile" element={authUser?.role=="admin"?<AdminProfilePage/>:<Navigate to="/login"/>}/>
      <Route path="/admin-page" element={authUser?.role=="admin"?<AdminPage/>:<Navigate to="/login"/>}/>
      <Route path="/manage-admin" element={authUser?.role=="admin"?<ManageAdmins/>:<Navigate to="/login"/>}/>
      <Route path="/manage-buses" element={authUser?.role=="admin"?<ManageBuses/>:<Navigate to="/login"/>}/>
      <Route path="/manage-busSchedule" element={authUser?.role=="admin"?<ManageBusSchedule/>:<Navigate to="/login"/>}/>
      <Route path="/manage-route" element={authUser?.role=="admin"?<ManageRoutes/>:<Navigate to="/login"/>}/>
      <Route path="/paymentsHist" element={authUser?.role=="admin"?<PayHistoryPage/>:<Navigate to="/login"/>}/>
     <Route
  path="/manage-routeWay/:route_id"
  element={
    authUser?.role === "admin" ? (
      <ManageRouteWay />
    ) : (
      <Navigate to="/login" />
    )
  }
/>

      <Route path="/manage-stops" element={authUser?.role=="admin"?<ManageStops/>:<Navigate to="/login"/>}/>

      </Routes>
      <Toaster />
    </div>
  );
};

export default App