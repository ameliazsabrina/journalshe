import React from "react";

const Footer: React.FC = () => (
  <footer style={{ textAlign: "center", padding: "1rem 0", marginTop: "2rem" }}>
    <hr style={{ margin: "0 0 1rem 0" }} />
    <small>
      &copy; {new Date().getFullYear()} All rights reserved to Journalshe.
    </small>
  </footer>
);

export default Footer;
