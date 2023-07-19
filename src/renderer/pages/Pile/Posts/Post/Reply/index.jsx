import { useParams } from 'react-router-dom';
import styles from '../Post.module.scss';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { postFormat } from 'renderer/utils/fileOperations';
import Editor from '../../../Editor';
import * as fileOperations from 'renderer/utils/fileOperations';
import { usePilesContext } from 'renderer/context/PilesContext';
import usePost from 'renderer/hooks/usePost';
import { AnimatePresence, motion } from 'framer-motion';

export default function Reply({
  postPath,
  isLast = false,
  isFirst = false,
  highlightColor,
}) {
  const { currentPile } = usePilesContext();
  const { post, cycleColor } = usePost(postPath);
  const [replying, setReplying] = useState(false);
  const [editable, setEditable] = useState(false);

  const toggleReplying = () => setReplying(!replying);
  const toggleEditable = () => setEditable(!editable);

  if (!post) return;

  const created = DateTime.fromISO(post.data.createdAt);
  const replies = post?.data?.replies || [];
  const isReply = post?.data?.isReply || false;

  return (
    <div>
      <div className={styles.post}>
        <div className={styles.left}>
          <div
            className={`${styles.connector} ${isFirst && styles.first}`}
          ></div>

          <div
            className={styles.ball}
            onDoubleClick={cycleColor}
            style={{
              backgroundColor: highlightColor ?? 'var(--border)',
            }}
          ></div>
          <div
            className={`${styles.line} ${!isLast && styles.show}`}
            style={{
              backgroundColor: highlightColor ?? 'var(--border)',
            }}
          ></div>
        </div>
        <div className={styles.right}>
          <div className={styles.header}>
            <div className={styles.title}>{post.name}</div>
            <div className={styles.meta}>
              {!isReply && (
                <div className={styles.replyButton} onClick={toggleReplying}>
                  Reply
                </div>
              )}

              <div className={styles.time} onClick={toggleEditable}>
                {created.toRelative()}
              </div>
            </div>
          </div>
          <div className={styles.editor}>
            <Editor
              postPath={postPath}
              editable={editable}
              setEditable={setEditable}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
