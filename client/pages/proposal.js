import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Tag, Widget, Blockie, Tooltip, Icon, Form, Table } from "web3uikit";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import styles from "../styles/Pages.module.css";

export default function Proposal() {
  const router = useRouter();
  const { description, color, text, id, proposer } = router.query;
  const { Moralis, isInitialized } = useMoralis();
  const [latestVote, setLatestVote] = useState();
  const [percUp, setPercUp] = useState(0);
  const [percDown, setPercDown] = useState(0);
  const [votes, setVotes] = useState([]);
  const [sub, setSub] = useState(false);
  const contractProcessor = useWeb3ExecuteFunction();

  useEffect(() => {
    if (isInitialized) {
      async function getVotes() {
        const Votes = Moralis.Object.extend("Votes");
        const query = new Moralis.Query(Votes);
        query.equalTo("proposal", id);
        query.descending("createdAt");
        const results = await query.find();
        if (results.length > 0) {
          setLatestVote(results[0].attributes);
          setPercDown(
            (
              (Number(results[0].attributes.votesDown) /
                (Number(results[0].attributes.votesDown) + Number(results[0].attributes.votesUp))) *
              100
            ).toFixed(0)
          );
          setPercUp(
            (
              (Number(results[0].attributes.votesUp) / (Number(results[0].attributes.votesDown) + Number(results[0].attributes.votesUp))) *
              100
            ).toFixed(0)
          );
        }

        const votesDirection = results.map((e) => [
          e.attributes.voter,
          <Icon
            fill={e.attributes.votedFor ? "#2cc40a" : "#d93d3d"}
            size={24}
            svg={e.attributes.votedFor ? "checkmark" : "arrowCircleDown"}
          />,
        ]);

        setVotes(votesDirection);
      }
      getVotes();
    }
  }, [isInitialized]);

  async function castVote(upDown) {
    let options = {
      contractAddress: "0x610E49E663Ffa2A98385618fe89a4723608b2E4B",
      functionName: "voteOnProposal",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_id",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_vote",
              type: "bool",
            },
          ],
          name: "voteOnProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: {
        _id: id,
        _vote: upDown,
      },
    };

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        console.log("Vote Cast Succesfully");
        setSub(false);
      },
      onError: (error) => {
        alert(error.data.message);
        setSub(false);
      },
    });
  }

  return (
    <div>
      <div className={styles.contentProposal}>
        <div className={styles.proposal}>
          <Link href="/">
            <div className={styles.backHome}>
              <Icon fill="#ffffff" size={20} svg="chevronLeft" />
              Overview
            </div>
          </Link>
          <div>{description}</div>
          <div className={styles.proposalOverview}>
            <Tag color={color} text={text} />
            <div className={styles.proposer}>
              <span>Proposed By </span>
              <Tooltip content={proposer}>
                <Blockie seed={proposer} />
              </Tooltip>
            </div>
          </div>
        </div>
        {latestVote && (
          <div className={styles.widgets}>
            <Widget info={latestVote.votesUp} title="Votes For">
              <div className={styles.extraWidgetInfo}>
                <div className={styles.extraTitle}>{percUp}%</div>
                <div className={styles.progress}>
                  <div className={styles.progressPercentage} style={{ width: `${percUp}%` }}></div>
                </div>
              </div>
            </Widget>
            <Widget info={latestVote.votesDown} title="Votes Against">
              <div className={styles.extraWidgetInfo}>
                <div className={styles.extraTitle}>{percDown}%</div>
                <div className={styles.progress}>
                  <div className={styles.progressPercentage} style={{ width: `${percDown}%` }}></div>
                </div>
              </div>
            </Widget>
          </div>
        )}
        <div className={styles.votesDiv}>
          <Table
            style={{ width: "60%" }}
            columnsConfig="90% 10%"
            data={votes}
            header={[<span>Address</span>, <span>Vote</span>]}
            pageSize={5}
          />

          <Form
            isDisabled={text !== "Ongoing"}
            style={{
              width: "35%",
              height: "250px",
              border: "1px solid rgba(6, 158, 252, 0.2)",
            }}
            buttonConfig={{
              isLoading: sub,
              loadingText: "Casting Vote",
              text: "Vote",
              theme: "secondary",
            }}
            data={[
              {
                inputWidth: "100%",
                name: "Cast Vote",
                options: ["For", "Against"],
                type: "radios",
                validation: {
                  required: true,
                },
              },
            ]}
            onSubmit={(e) => {
              if (e.data[0].inputResult[0] === "For") {
                castVote(true);
              } else {
                castVote(false);
              }
              setSub(true);
            }}
            title="Cast Vote"
          />
        </div>
      </div>
    </div>
  );
}
