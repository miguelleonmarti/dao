import styles from "../styles/Layout.module.css";
import Image from "next/image";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <div className={styles.header}>
      <Image src={"/polygon.png"} height={50} width={50} />
      <ConnectButton />
    </div>
  );
};

export default Header;
