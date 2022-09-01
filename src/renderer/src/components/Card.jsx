import { Card as AntCard } from "antd";
import { Link } from "react-router-dom";

export default function Card({ children, ...restProps }) {
  return (
    <AntCard {...restProps} className="funan-card">
      <div className="funan-sub-card">{children}</div>
    </AntCard>
  );
}

Card.Auto = function CardAuto({ reverse, children, ...restProps }) {
  return (
    <AntCard
      {...restProps}
      className={`
    funan-card-auto
    ${reverse && "funan-card-auto-reverse"}
  `}
    >
      <div className="funan-sub-card">{children}</div>
    </AntCard>
  );
};

Card.Blog = function CardBlog({ link, children, ...restProps }) {
  return (
    <Link to={link}>
      <AntCard {...restProps} className="funan-card">
        <div className="funan-sub-card">{children}</div>
      </AntCard>
    </Link>
  );
};
