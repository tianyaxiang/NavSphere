interface LetterAvatarProps {
  title: string
  className?: string
}

// 确定性:同名永远同色(不使用 Math.random)。背景色由 title 哈希得到的色相决定。
export function LetterAvatar({ title, className }: LetterAvatarProps) {
  const trimmed = (title || '').trim()
  // Array.from 防止 emoji / 代理对被截断
  const letter = Array.from(trimmed)[0]?.toUpperCase() ?? '#'

  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash |= 0 // 收敛到 32 位整数
  }
  const hue = Math.abs(hash) % 360

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-md font-semibold text-white select-none text-sm sm:text-lg ${className ?? ''}`}
      style={{ backgroundColor: `hsl(${hue}, 65%, 45%)` }}
    >
      {letter}
    </div>
  )
}
