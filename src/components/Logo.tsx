interface LogoProps {
  style?: string;
  size?: 'sm' | 'md' | 'lg';
}

function Logo({ style = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${style}`}>
      <img src="/delta.svg" alt="Delta logo" className={`${sizeClasses[size]} text-primary`} />
      <span
        className={`font-bold ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-lg'}`}
      >
        delta
      </span>
    </div>
  );
}

export default Logo;
