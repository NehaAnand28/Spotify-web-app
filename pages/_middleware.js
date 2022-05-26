import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  //token will exits if user is logged in 
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const { pathname } = req.nextUrl;
  //Allow the requests if the following is true
  //1) If request for  next auth session and provider fetching
  //2) If token exists
  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  //Redirect them to login if they dont have a token and are requesting a protected route
  if (!token && pathname !== "/login") {
    return NextResponse.redirect("/login");
  }
}
