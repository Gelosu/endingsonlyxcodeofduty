// Ornate gold corner brackets, Genshin-UI style. Drop inside any
// `position: relative` container to frame it.
export default function CornerFrame() {
  return (
    <>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
    </>
  );
}
