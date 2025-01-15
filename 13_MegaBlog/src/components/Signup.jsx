import { useState } from "react"
import React from 'react'
import authService from "../appwrite/auth"
import {Link, useNavigate } from 'react-router-dom'
import { login as authLogin, login } from '../store/authSlice'
import {useForm} from 'react-hook-form'
import { Button, Input, Logo} from "./index"
import { useDispatch } from "react-redux"

function Signup() {
    const navigate = useNavigate();
    const [error, setErrror] =useState("")
    const dispatch = useDispatch()
    const {register, setRegister} =useForm()

    const create = async(data) => {
        setErrror("")
        try {
            const userData = await authService.createAccount(data)
            if(userData){
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(login(userData));
                navigate("/"); 
            }
        } catch (error) {
            setErrror(error.message)
        }
    }
  return (
    <div className="flex iteams-center justify-center">
        <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
            <div className="mb-2 flex justify-center">
                <span className="inline-block w-full max-w-{100px}">
                    <Logo width="100%"/>
                </span>
            </div>
            <h2 className="text-center text-2xl font-bold leading-tight">Sign up to your account</h2>
            <p className="mt-2 text-center text-base text-black/60"> Already have Account?&nbsp;
                <Link
                    to="/login"
                    className="font-medium text-primary translate-all duration-200 hover:underline"
                >
                    Sign In
                </Link>
            </p>
            {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
            <form onSubmit={handleSumbit(create)}>
                <div className="space-y-5">
                    <Input 
                        lable="Full Name : "
                        placeholder = "Enter your full name :"
                        {...register("name",{
                            reqired: true,
                        })}
                    />
                    <Input 
                        lable = "Email: "
                        placeholder="Enter your Email :"
                        type="email"
                        {...register("email", {
                            required : true,
                            validate : {
                                matchMediaPatern : (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                "Email address must be a valid address",
                            }
                        })}
                    />
                    <Input 
                        lable="Passwprd : "
                        type="password"
                        placeholder="Enter the password"
                        {...register("password",{
                            required : true
                        })}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                    >Create Account</Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Signup
