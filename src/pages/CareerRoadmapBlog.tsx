import { Helmet } from "react-helmet-async"

export default function CareerRoadmapBlog() {
    return (
        <>
            <Helmet>
                <title>
                    Career Roadmap for College Students (Step-by-Step Guide) | Careerly
                </title>

                <meta
                    name="description"
                    content="A practical step-by-step career roadmap guide for college students. Learn how to identify skill gaps, choose the right path, and build resume-worthy projects."
                />

                <link
                    rel="canonical"
                    href="https://careerly-pi.vercel.app/blog/career-roadmap-for-college-students"
                />
            </Helmet>

            <div className="min-h-screen bg-slate-50 flex flex-col items-center">
                <div className="w-full max-w-3xl bg-white shadow-sm rounded-xl mt-10 mb-10 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                        Career Roadmap for College Students (Step-by-Step Guide)
                    </h1>

                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        Most college students feel lost when planning their career. With so many technologies, frameworks, and conflicting advice, it's hard to know where to start. This guide breaks down a proven roadmap to go from confused student to job-ready professional.
                    </p>

                    <div className="border-t border-slate-100 my-8"></div>

                    <h2 className="text-2xl font-semibold text-slate-800 mt-10 mb-4">
                        Step 1: Identify Your Career Direction
                    </h2>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Instead of learning random skills, start by exploring different paths. Are you interested in frontend development, backend systems, data science, or mobile apps?
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-slate-600 space-y-2">
                        <li><strong>Experiment early:</strong> Try building a simple website, a small python script, or analyzing a dataset.</li>
                        <li><strong>Research roles:</strong> Look at job descriptions for roles that interest you to see what skills are in demand.</li>
                        <li><strong>Talk to seniors:</strong> Ask upperclassmen or alumni about their roles and what their day-to-day looks like.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-slate-800 mt-10 mb-4">
                        Step 2: Perform a Skill Gap Analysis
                    </h2>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Once you have a direction, you need to know where you stand. A skill gap analysis helps you identify what you already know and what you need to learn.
                    </p>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Compare your current skills against the requirements for your dream role. This will give you a clear list of technologies and concepts to focus on.
                    </p>

                    <h2 className="text-2xl font-semibold text-slate-800 mt-10 mb-4">
                        Step 3: Build Resume-Worthy Projects
                    </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Tutorials are great, but projects get you hired. Build projects that solve real problems.
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-slate-600 space-y-2">
                        <li>Don't just copy-paste tutorial code. Add your own features.</li>
                        <li>Document your learning process in a README file.</li>
                        <li>Deploy your projects so others can use them.</li>
                    </ul>

                    <div className="mt-12 p-8 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                        <h3 className="text-xl font-semibold text-indigo-900 mb-2">
                            Want an automated AI-powered roadmap?
                        </h3>
                        <p className="text-indigo-700 mb-6">
                            Careerly builds a personalized learning path just for you.
                        </p>
                        <a
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150"
                        >
                            Try Careerly for Free →
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}
