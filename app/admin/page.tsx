import React from 'react'

const page = () => {
  return (
//    Solicita permisos de administrador o redirige a /api/auth/signin
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Bienvenido al panel de administración
      </h1>
      <p className="text-gray-600">
        Desde aquí puedes gestionar las diferentes secciones del portal.
      </p>
      <p className="text-gray-600">
        Asegúrate de tener los permisos necesarios para acceder a esta área.
      </p>
      <p className="text-gray-600">
        Si no tienes acceso, contacta al administrador del sistema.
      </p>
    </div>

  )
}

export default page