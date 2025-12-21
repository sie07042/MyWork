import { BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/signup'
import { AuthProvider } from './contexts/AuthProvider'

function App() {


  return (
    <>
      {/* 중요!!! : AuthProvider가 모든 컴포넌트에 인증 정보를 제공해야 하므로 전체를 감싼다.*/}
      <AuthProvider>
        <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home />}/>
              <Route path='/login' element={<Login />}/>
              <Route path='/signup' element={<Signup />}/>
            </Routes>
          </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
