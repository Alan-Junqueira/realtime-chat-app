'use client'

import { ReactNode } from "react"
import { Toaster } from "react-hot-toast"

interface IProvidersProps {
  children: ReactNode
}

export const Providers = ({ children }: IProvidersProps) => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </>
  )
}
