export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>
          &copy; 2017-{new Date().getFullYear()}{' '}
          <a href="/about" className="font-bold hover:text-gray-900">
            dh.leti.ltd
          </a>
          {' '}design by{' '}
          <a 
            href="https://www.viggoz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:text-gray-900"
          >
            Viggo
          </a>
        </p>
      </div>
    </footer>
  )
} 