import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <header className="container mx-auto px-4 py-6 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-blue-800">
                        TowTackle
                    </h1>
                </div>
                <nav className="flex space-x-4">
                    <Link
                        href="/auth/login"
                        className="px-4 py-2 text-blue-600 hover:text-blue-800 transition"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/register"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                        Get Started
                    </Link>
                </nav>
            </header>

            <main className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-4xl font-bold text-blue-900 mb-6 leading-tight">
                        Streamline Towing and Incident Management
                    </h2>
                    <p className="text-xl text-blue-700 mb-8">
                        TowTackle connects clients and service providers, making
                        road assistance faster and more efficient.
                    </p>
                    <div className="flex space-x-4">
                        <Link
                            href="/register"
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
                        >
                            For Drivers
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-3 bg-white text-blue-600 rounded-lg border border-blue-500 hover:bg-blue-50 transition shadow-md"
                        >
                            For Clients
                        </Link>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Image
                        alt="TowTackle Hero"
                        src={process.env.NODE_ENV === 'production' ? '/towtackle/hero-image.jpg' : '/hero-image.jpg'}
                        width={500}
                        height={500}
                        className="rounded-xl shadow-2xl"
                    />
                </div>
            </main>

            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12 text-blue-900">
                        How TowTackle Works
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Quick Request",
                                description:
                                    "Instantly request roadside assistance with just a few taps.",
                                icon: "🚨",
                            },
                            {
                                title: "Real-time Tracking",
                                description:
                                    "Track your tow truck's location in real-time.",
                                icon: "📍",
                            },
                            {
                                title: "Seamless Communication",
                                description:
                                    "Direct messaging with your service provider.",
                                icon: "💬",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-blue-50 p-6 rounded-xl text-center hover:shadow-md transition"
                            >
                                <div className="text-5xl mb-4">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-semibold mb-3 text-blue-900">
                                    {feature.title}
                                </h4>
                                <p className="text-blue-700">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-blue-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2023 TowTackle. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
