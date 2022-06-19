import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider appId={"jA8UpaTkf04VWM7OJtpRkmDeWmLMuJrV2q6smoQF"} serverUrl={"https://d3ncibarfsf6.usemoralis.com:2053/server"}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </MoralisProvider>
  );
}

export default MyApp;
