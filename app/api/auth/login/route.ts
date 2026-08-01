import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, keepLoggedIn } = await request.json();

    if (email === 'yash@gmail.com' && password === 'toxic') {
      const response = NextResponse.json({ success: true });
      
      const cookieOptions: {
        name: string;
        value: string;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax';
        path: string;
        maxAge?: number;
      } = {
        name: 'auth_session',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      };

      if (keepLoggedIn) {
        cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
      }

      response.cookies.set(cookieOptions);
      
      return response;
    }

    return NextResponse.json({ error: 'invalid creds' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
