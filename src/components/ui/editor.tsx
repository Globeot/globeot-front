"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { 
  Heading1, Heading2, Heading3, 
  List, ListOrdered 
} from 'lucide-react'

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // H1, H2, H3 및 BulletList, OrderedList 기능이 이 안에 기본 내장되어 있습니다.
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // 작성된 서식 내용을 HTML 문자열로 부모 컴포넌트에 전달합니다.
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  // 버튼의 활성화 여부에 따라 배경색을 바꿔주는 스타일 헬퍼
  const getBtnStyle = (isActive: boolean) => ({
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    background: isActive ? '#eff6ff' : '#ffffff',
    color: isActive ? '#2563eb' : '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
  })

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      
      {/* 🛠️ 상단 툴바 구역 */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        padding: '8px', 
        background: '#f9fafb', 
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap'
      }}>
        {/* H1 버튼 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          style={getBtnStyle(editor.isActive('heading', { level: 1 }))}
        >
          <Heading1 size={16} style={{ marginRight: '2px' }} />1
        </button>

        {/* H2 버튼 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={getBtnStyle(editor.isActive('heading', { level: 2 }))}
        >
          <Heading2 size={16} style={{ marginRight: '2px' }} />2
        </button>

        {/* H3 버튼 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={getBtnStyle(editor.isActive('heading', { level: 3 }))}
        >
          <Heading3 size={16} style={{ marginRight: '2px' }} />3
        </button>

        {/* 구분선 */}
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />

        {/* 불릿 리스트 (점) */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={getBtnStyle(editor.isActive('bulletList'))}
        >
          <List size={16} />
        </button>

        {/* 넘버링 리스트 (숫자) */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={getBtnStyle(editor.isActive('orderedList'))}
        >
          <ListOrdered size={16} />
        </button>
      </div>

      {/* ✍️ 글씨 작성 본문 구역 */}
      <div style={{ padding: '15px', minHeight: '250px' }}>
        <EditorContent editor={editor} />
      </div>

      {/* 🎨 본문 안에서 H1~3, 리스트 태그들이 정상적으로 보이게 해주는 최소한의 CSS */}
      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror h1 { font-size: 1.8em; font-weight: 700; margin-bottom: 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.4em; }
        .ProseMirror h3 { font-size: 1.2em; font-weight: 600; margin-bottom: 0.3em; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5em; }
        .ProseMirror p { margin-bottom: 0.5em; }
      `}</style>
    </div>
  )
}