export default function Page() {
  return (
    <main className=' justify-center h-full'>
      <div>
        <h1>404 - Page not found</h1>
        <p>
          Sorry, the page you are looking for does not exist. You can always return to the{' '}
          <a href='/' className='underline-offset-4 hover:underline text-blue-500'>
            Home page
          </a>
          .
        </p>
      </div>
    </main>
  );
}
