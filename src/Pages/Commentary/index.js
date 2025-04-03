import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

const Page = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const commentary = location.state?.commentary;

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.goBackWrapper}>
        <button onClick={handleGoBack} className={styles.goBackButton}>
          ← Back
        </button>
      </div>

      {/* Commentary Content */}
      <div className={styles.content}>
        <h2>Commentary</h2>
        {commentary ? (
          <div className={styles.markdownWrapper}>
            <ReactMarkdown
              children={commentary}
              remarkPlugins={[remarkBreaks]} // optional if you want single line breaks
              components={{
                p: ({ node, ...props }) => <p style={{ marginBottom: '1.5rem' }} {...props} />,
              }}
            />
          </div>        
        ) : (
          <p className={styles.empty}>No commentary available for this verse.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
