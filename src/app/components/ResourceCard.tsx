import Image from 'next/image'
import Link from 'next/link'
import { ResourceItem } from '../types/navigation'

type ResourceCardProps = ResourceItem

export default function ResourceCard({ title, description, icon, url }: ResourceCardProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card hover:shadow-lg transition-shadow"
    >
      <div className="card-content">
        <div className="card-icon">
          <Image
            src={icon}
            alt={title}
            width={48}
            height={48}
            className="rounded-lg"
          />
        </div>
        <div className="card-text">
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
        </div>
      </div>
    </Link>
  )
} 