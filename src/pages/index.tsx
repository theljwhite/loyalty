export default function Home() {
  return (
    <>
      <main className="ease-soft-in-out mt-0 transition-all duration-200">
        <section className="mb-32 min-h-screen">
          <div className="min-h-50-screen relative m-4 flex items-start overflow-hidden rounded-xl  pb-56 pt-12">
            <span className="absolute left-0 top-0 h-full w-full" />
            <div className="mx-auto my-auto w-full px-4">
              <div className="-mx-3 flex flex-wrap justify-center">
                <div className="lg:flex-0 mx-auto mt-0 w-full max-w-full shrink-0 px-3 text-center lg:w-5/12">
                  <h1
                    className="mb-2 mt-12 font-lunch text-3xl
                  font-bold tracking-tight text-primary-1
                  "
                  >
                    Work in progress...
                  </h1>
                  <p className="font-lunch text-sm text-neutral-8">
                    Please hang tight while the app is being developed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
