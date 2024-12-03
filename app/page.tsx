import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
            <header className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-blue-900">TowTackle</h1>
                </div>
                <nav className="hidden sm:block space-x-6">
                    <Link 
                        href="/auth/login" 
                        className="text-blue-900 hover:text-blue-700 font-medium"
                    >
                        Login
                    </Link>
                    <Link 
                        href="/auth/register" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Get Started
                    </Link>
                </nav>
                <div className="sm:hidden">
                    <Link 
                        href="/auth/login" 
                        className="text-blue-900 hover:text-blue-700 font-medium mr-4"
                    >
                        Login
                    </Link>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center text-center md:text-left">
                    <div className="space-y-3 order-1 md:order-1">
                        <h1 className="text-4xl font-bold text-blue-900 leading-tight">
                            Streamline Towing <br />and Incident Management
                        </h1>
                        <p className="text-lg text-blue-800 mb-3 hidden md:block">
                            Connecting clients and service providers, making road assistance faster and more efficient.
                        </p>
                    </div>
                    <div className="flex justify-center order-2 md:order-2">
                        <Image
                            alt="TowTackle Hero"
                            src={process.env.NODE_ENV === 'production' ? '/towtackle/hero-image.jpg' : '/hero-image.jpg'}
                            width={300}
                            height={300}
                            className="rounded-xl shadow-2xl max-w-full"
                        />
                    </div>
                    <div className="col-span-full order-3 text-center md:text-left md:hidden">
                        <p className="text-base text-blue-800 mb-3">
                            Connecting clients and service providers, making road assistance faster and more efficient.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
