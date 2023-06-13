'use client'

import { ButtonHTMLAttributes, useState } from "react";
import { Button } from "./ui/Button";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

interface ISignOutButton extends ButtonHTMLAttributes<HTMLButtonElement> { }

export const SignOutButton = ({ ...props }: ISignOutButton) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()
    } catch (error) {
      toast.error('There was a problem signing out')
    } finally {
      setIsSigningOut(false)
    }
  }
  return (
    <Button {...props} variant='ghost' onClick={handleSignOut}>
      {isSigningOut ? <Loader2 className="animate-spin h-4 w-4" /> : <LogOut className="w-4 h-4" />}
    </Button>
  )
}
