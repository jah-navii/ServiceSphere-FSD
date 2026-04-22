const Img = ({ src, alt = '', className, style, ...props }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    style={style}
    loading="lazy"
    decoding="async"
    {...props}
  />
);

export default Img;
