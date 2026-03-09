// In-memory mock database for blogs
const blogs = [
    {
        id: 1,
        title: "Mastering React Server Components",
        excerpt: "Discover how to leverage RSCs for optimal performance and seamless data fetching in your next big application.",
        content: "React Server Components (RSC) represent a paradigm shift in how we build React applications. By rendering components exclusively on the server, we can significantly reduce the amount of JavaScript sent to the client. This leads to faster Time to Interactive (TTI) and better SEO.",
        type: 'free',
        date: "Oct 24, 2024"
    },
    {
        id: 2,
        title: "Advanced Tailwind Architecture",
        excerpt: "Stop building messy styling structures. Learn the enterprise-grade patterns for managing complex Tailwind configurations.",
        content: "If you're reading this, you are authenticated! As your Tailwind CSS projects grow, the utility classes can become unmanageable. To solve this, enterprise teams use the CVA (Class Variance Authority) pattern combined with tailwind-merge to safely construct component APIs without style conflicts.",
        type: 'premium',
        date: "Nov 02, 2024"
    },
    {
        id: 3,
        title: "The Ultimate Guide to Turbopack",
        excerpt: "Speed up your build times by 10x. A comprehensive deep dive into the Rust-based bundler replacing Webpack.",
        content: "Turbopack is the successor to Webpack, rewritten from the ground up in Rust. It utilizes Incremental Computation to cache every function result, ensuring that your development server scales effortlessly regardless of how large your application gets.",
        type: 'free',
        date: "Dec 15, 2024"
    },
    {
        id: 4,
        title: "Building Micro-frontends with Vite",
        excerpt: "Scaling frontend applications across multiple teams? Learn how Module Federation in Vite makes it seamless.",
        content: "Welcome to the premium section! Module Federation allows you to dynamically load code from another application at runtime. With the @originjs/vite-plugin-federation plugin, Vite users can now share dependencies and components seamlessly without having to use Webpack.",
        type: 'premium',
        date: "Jan 05, 2025"
    },
    {
        id: 5,
        title: "Next-Gen AI Authentication",
        excerpt: "Implement biometric and passthrough authentication flows securely without traditional passwords.",
        content: "Thanks for subscribing! Passkeys and WebAuthn are replacing standard passwords. In this guide, we dive into how you can implement biometric authentication flows that use the device's secure enclave rather than sending passwords over the wire.",
        type: 'premium',
        date: "Feb 18, 2025"
    },
    {
        id: 6,
        title: "Zero-JS Interactivity Techniques",
        excerpt: "How to use modern HTML and CSS to create complex state interactions without writing a single line of JavaScript.",
        content: "You'd be surprised how much you can do with just CSS. Using the :has() pseudo-class and visually-hidden checkboxes (the checkbox hack), you can build accordions, tabs, and even simple games without any client-side JavaScript execution.",
        type: 'free',
        date: "Mar 11, 2025"
    }
];

module.exports = {
    blogs
};
