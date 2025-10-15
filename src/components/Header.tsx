import Link from "next/link"



const Header = () => {
  return (
    <header>
        <nav className="w-full h-16 bg-gray-800 text-white flex items-center justify-between px-4">
            <Link href="/">Home</Link>
            <Link href="/about">Sign in</Link>
            <Link href='/login' className="border rounded-lg border-white p-2">Sign up</Link>
        </nav>
    </header>
  )
}

export default Header