# Chat Storage & Sharing Features - User Guide

## 🎯 Features Overview

The chatbot now has **two main features** that are visible in the UI:

### 1. ✅ **Chat Storage to Backend**
All your chats are automatically saved to the backend database (not just localStorage).

### 2. ✅ **Shareable Links**
Every chat can be shared with a unique link that anyone can view.

---

## 📍 Where to See the Features

### **Feature 1: Share Button in Sidebar**

**Location:** Left sidebar, next to each conversation

**How to see it:**
1. Open the chatbot at `http://localhost:3000/chatbot`
2. Look at the left sidebar (chat history)
3. Hover over any conversation item
4. You'll see **two buttons appear**:
   - **Share button** (purple icon with Share2 icon) - on the left
   - **Delete button** (red icon with Trash2 icon) - on the right

**Visual indicators:**
- Share button is **purple** when not shared
- Share button turns **green** when chat is shared
- A small **green badge** appears next to the chat title when shared

### **Feature 2: Copy Link Button in Top Bar**

**Location:** Top right of the chat area

**How to see it:**
1. Share a chat (click the share button in sidebar)
2. The chat becomes shared
3. A **"Copy Link"** button appears in the top bar (right side)
4. Click it to copy the shareable link to clipboard
5. Button shows "Copied!" when successful

---

## 🚀 How to Use

### **Step 1: Start a Chat**
1. Go to `http://localhost:3000/chatbot`
2. Type a message and send it
3. Chat is **automatically saved** to backend

### **Step 2: Share a Chat**
1. Hover over a conversation in the sidebar
2. Click the **Share button** (purple icon)
3. Chat becomes shared (button turns green)
4. Share link is **automatically copied** to clipboard

### **Step 3: Copy Share Link**
1. When viewing a shared chat, you'll see **"Copy Link"** button in top bar
2. Click it anytime to copy the link again
3. Share the link with anyone: `http://localhost:3000/chatbot/share/<share_id>`

### **Step 4: View Shared Chat**
1. Open the share link in any browser
2. No login required - it's public
3. View the entire conversation (read-only)

---

## 🎨 Visual Indicators

### **In Sidebar:**
- **Purple share icon** = Not shared
- **Green share icon** = Shared
- **Green badge** next to title = Shared chat
- **Hover effect** = Buttons become more visible

### **In Top Bar:**
- **"Copy Link" button** = Only visible when viewing a shared chat
- **"Copied!" message** = Confirms link was copied

---

## 🔍 Troubleshooting

### **Can't see share button?**
- Make sure you're logged in (authentication required)
- Hover over the conversation item in sidebar
- Buttons appear on hover (60% opacity normally, 100% on hover)

### **Share button not working?**
- Check browser console for errors
- Make sure backend is running on port 8000
- Verify you're authenticated (check localStorage for authToken)

### **Chats not saving?**
- Check network tab in browser DevTools
- Verify API calls to `/api/chats/` are successful
- Check backend logs for errors

---

## 📱 UI Elements Summary

| Element | Location | When Visible | Purpose |
|---------|----------|--------------|---------|
| Share Button | Sidebar (conversation item) | On hover | Share/unshare chat |
| Delete Button | Sidebar (conversation item) | On hover | Delete chat |
| Copy Link Button | Top bar (right side) | When viewing shared chat | Copy share link |
| Shared Badge | Next to chat title | When chat is shared | Visual indicator |

---

## ✅ Testing Checklist

- [ ] Start a new chat - should save automatically
- [ ] Hover over conversation - see share and delete buttons
- [ ] Click share button - chat becomes shared, button turns green
- [ ] See "Copy Link" button in top bar
- [ ] Click "Copy Link" - link copied to clipboard
- [ ] Open share link in new tab - see shared chat (no login)
- [ ] Click share button again - unshare the chat

---

## 🎉 Everything is Working!

All features are implemented and visible in the UI. The share buttons appear when you hover over conversations in the sidebar, and the copy link button appears in the top bar when viewing a shared chat.
