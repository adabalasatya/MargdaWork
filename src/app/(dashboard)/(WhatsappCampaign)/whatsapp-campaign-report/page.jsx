'use client';

import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiArrowLeft, FiSend } from "react-icons/fi";
import { FaTimes, FaUserCircle, FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Loader from "@/app/component/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import AddToTask from "@/app/(dashboard)/(WhatsappCampaign)/addtotaskwhatapp/page";

const WhatsappReport = () => {
  const router = useRouter();
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [lists, setLists] = useState([]);
  const [chats, setChats] = useState([]);
  const [addToListCon, setShowAddToListCon] = useState(false);
  const [selectedList, setSelectedList] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const conversationsListRef = useRef(null);
  const chatDetailsRef = useRef(null);
  const [conversationsScroll, setConversationsScroll] = useState(0);
  const [chatDetailsScroll, setChatDetailsScroll] = useState(0);
  const [userWMobile, setUserWMobile] = useState("911234567890");
  const [listContacts, setListContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignID, setSelectedCampaignID] = useState("");
  const [userID, setUserID] = useState("");
  const [selectedDataID, setSelectedDataID] = useState("");
  const [showAddToTask, setShowAddToTask] = useState(false);

  // Safe sessionStorage access
  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  };

  useEffect(() => {
    const userData = getUserData();
    if (!userData || !userData.pic) {
      return router.push("/work/login");
    } else {
      const userID = userData.userID;
      setUserID(userID);
      fetchData(userID);
      fetchCampaigns(userID);
      fetchLists(userID);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, chats]);

  useEffect(() => {
    if (conversationsListRef.current) {
      conversationsListRef.current.scrollTop = conversationsScroll;
    }
    if (chatDetailsRef.current) {
      chatDetailsRef.current.scrollTop = chatDetailsScroll;
    }
  }, [conversationsScroll, chatDetailsScroll]);

  const fetchData = async (userID) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/whatsapp-campaign/get-report",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChats(data.data);
        processContactsFromChats(data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch chat data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/get-campaigns",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLists = async (userID) => {
    try {
      // Replace with actual API endpoint for lists
      const response = await fetch(
        "https://www.margda.in/miraj/work/get-lists",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLists(data.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const processContactsFromChats = (chatData) => {
    const contactsMap = new Map();

    chatData.forEach((chat) => {
      const phoneNumber =
        chat.sender === userWMobile ? chat.receiver : chat.sender;

      if (!contactsMap.has(phoneNumber)) {
        contactsMap.set(phoneNumber, {
          phoneNumber,
          profilePic: "",
          unread: 0,
          lastMessageDate: chat.edate,
          lastMessage: chat,
        });
      } else {
        const existing = contactsMap.get(phoneNumber);
        if (new Date(chat.edate) > new Date(existing.lastMessageDate)) {
          existing.lastMessageDate = chat.edate;
          existing.lastMessage = chat;
        }
      }
    });
    console.log(Array.from(contactsMap.values()));
    setAllContacts(Array.from(contactsMap.values()));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "Unknown";
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    } else if (cleaned.length === 12) {
      return cleaned;
    }
    return phoneNumber;
  };

  const getFilteredContacts = () => {
    let filtered = allContacts;
    if (selectedList) {
      const listContactsNumbers = listContacts
        .filter((contact) => contact.listID === selectedList)
        .map((contact) => contact.phoneNumber);
      filtered = filtered.filter((contact) =>
        listContactsNumbers.includes(contact.phoneNumber)
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((contact) =>
        contact.phoneNumber.toLowerCase().includes(query)
      );
    }
    if (selectedCampaignID) {
      const campaignContacts = chats
        .filter((chat) => chat.campaignID == selectedCampaignID)
        .map((chat) =>
          chat.sender === userWMobile ? chat.receiver : chat.sender
        );
      filtered = filtered.filter((contact) =>
        campaignContacts.includes(contact.phoneNumber)
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
    );
  };

  const getFilteredMessages = () => {
    if (!selectedChat) return [];
    let messages = chats.filter((message) => {
      return (
        message.sender === selectedChat.phoneNumber ||
        message.receiver === selectedChat.phoneNumber
      );
    });

    if (fromDate || toDate) {
      messages = messages.filter((message) => {
        const messageDate = new Date(message.edate);
        const from = fromDate ? new Date(fromDate) : null;
        if (from) from.setHours(0, 0, 0, 0);
        const to = toDate ? new Date(toDate) : null;
        if (to) to.setHours(23, 59, 59, 999);
        const isAfterFrom = !from || messageDate >= from;
        const isBeforeTo = !to || messageDate <= to;
        return isAfterFrom && isBeforeTo;
      });
    }

    return messages.sort((a, b) => new Date(a.edate) - new Date(b.edate));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        userID,
        sender: userWMobile,
        receiver: selectedChat.phoneNumber,
        message: newMessage,
        campaignID: selectedCampaignID || null,
      };

      // Replace with actual send message API
      const response = await fetch(
        "https://www.margda.in/miraj/work/whatsapp/send-message",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const newChat = {
          whatsID: Date.now(),
          sender: userWMobile,
          receiver: selectedChat.phoneNumber,
          message: newMessage,
          edate: new Date().toISOString(),
          direction: "O",
          campaignID: selectedCampaignID || null,
        };

        setChats((prev) => [...prev, newChat]);
        setNewMessage("");
        toast.success("Message sent!");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearDates = () => {
    setFromDate("");
    setToDate("");
  };

  const selectChat = (conv) => {
    if (conversationsListRef.current) {
      setConversationsScroll(conversationsListRef.current.scrollTop);
    }
    if (chatDetailsRef.current) {
      setChatDetailsScroll(chatDetailsRef.current.scrollTop);
    }
    setSelectedChat(conv);
  };

  const handleAddToListClick = (conv) => {
    setSelectedDataID(conv);
    setShowAddToTask(true);
  };

  const closeMessagePopup = () => {
    setSelectedMessage(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getLastMessagePreview = (conv) => {
    const lastMessage = conv.lastMessage;
    if (!lastMessage) return "No messages";
    if (lastMessage.message) {
      return lastMessage.message.length > 30
        ? `${lastMessage.message.substring(0, 30)}...`
        : lastMessage.message;
    }
    if (lastMessage.pic_url) return "📷 Photo";
    if (lastMessage.doc_url) return "📄 Document";
    if (lastMessage.video_url) return "🎥 Video";
    if (lastMessage.audio_url) return "🔊 Audio";
    return "No message content";
  };

  const filteredContacts = getFilteredContacts();
  const filteredMessages = getFilteredMessages();

  return (
    <div className="min-h-[100px] overflow-hidden flex flex-col">
      <ToastContainer position="top-right" autoClose={5000} />
      {loading && <Loader />}

      {/* Main Content Container */}
      <div className="w-full fixed max-w-6xl ml-12 mx-auto p-4 mt-2 h-[calc(90vh-20px)] flex flex-col gap-4">
        
        {/* Header - Now inside main container */}
        <div className="w-full p-4 rounded-md bg-white shadow-sm border-2 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#008069]"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#008069]"
                />
              </div>
              <button
                onClick={clearDates}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-[#075e54]"
              >
                Clear
              </button>
            </div>
            <h2 className="text-xl font-semibold text-blue-600 flex items-center justify-center gap-2">
              <FaWhatsapp /> WhatsApp Chat
            </h2>
            <div className="flex gap-2">
              <select
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={selectedCampaignID}
                onChange={(e) => setSelectedCampaignID(e.target.value)}
              >
                <option value="">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.campaignID} value={campaign.campaignID}>
                    {campaign.campaign_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md border-2 border-gray-200 flex-1 overflow-hidden">
          {/* Conversations List */}
          <div
            className={`md:w-1/3 flex flex-col border-r border-gray-200 ${
              selectedChat && !addToListCon ? "hidden md:flex" : "flex"
            }`}
            ref={conversationsListRef}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008069] text-sm"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((conv) => (
                  <motion.div
                    key={formatPhoneNumber(conv.phoneNumber)}
                    onClick={() => selectChat(conv)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedChat?.phoneNumber === conv.phoneNumber
                        ? "bg-[#E6F0FA]"
                        : ""
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {conv.profilePic ? (
                          <img
                            src={conv.profilePic}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                        ) : (
                          <FaUserCircle className="w-12 h-12 text-gray-400" />
                        )}
                        <FaUserCircle
                          className="w-12 h-12 text-gray-400 absolute"
                          style={{ display: "none" }}
                        />
                        {conv.unread > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {conv.phoneNumber || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {getLastMessagePreview(conv)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatDate(conv.lastMessageDate)}
                        </p>
                        {conv.lastMessage && conv.lastMessage.taskName ? (
                          <span className="text-xs text-[#008069] bg-[#E6F0FA] px-2 py-1 rounded-full mt-1 inline-block">
                            {conv.lastMessage.taskName}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToListClick(conv);
                            }}
                            className="text-xs text-blue-500 hover:text-blue-600 bg-[#E6F0FA] px-2 py-1 rounded-full mt-1"
                          >
                            + Add to Task
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FaWhatsapp className="text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">
                    No conversations found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Details */}
          <div
            className={`flex-1 flex flex-col h-full ${
              selectedChat && !addToListCon ? "flex" : "hidden md:flex"
            }`}
            ref={chatDetailsRef}
          >
            {selectedChat ? (
              <>
                <div className="bg-blue-500 p-4 flex items-center justify-between text-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden hover:text-gray-200"
                    >
                      <FiArrowLeft size={20} />
                    </button>
                    <div className="relative">
                      {selectedChat.profilePic ? (
                        <img
                          src={selectedChat.profilePic}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-200" />
                      )}
                      <FaUserCircle
                        className="w-10 h-10 text-gray-200 absolute"
                        style={{ display: "none" }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {formatPhoneNumber(selectedChat.phoneNumber) ||
                          "Unknown"}
                      </p>
                      <p className="text-xs opacity-80">
                        {selectedChat.listName || "Click here for contact info"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="hover:text-gray-200"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-[#e5ddd5]">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((message, index, arr) => {
                        const showDateSeparator =
                          index === 0 ||
                          new Date(message.edate).toDateString() !==
                            new Date(arr[index - 1].edate).toDateString();
                        const isSent = message.sender === userWMobile;

                        return (
                          <React.Fragment key={message.whatsID}>
                            {showDateSeparator && (
                              <div className="flex justify-center my-4">
                                <span className="bg-white text-xs text-gray-600 px-3 py-1 rounded-full shadow">
                                  {new Date(message.edate).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex ${
                                isSent ? "justify-end" : "justify-start"
                              } mb-2`}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`max-w-[75%] p-3 rounded-lg shadow-sm relative ${
                                  isSent
                                    ? "bg-[#dcf8c6] rounded-br-none"
                                    : "bg-white rounded-bl-none"
                                }`}
                                style={{
                                  wordWrap: "break-word",
                                  wordBreak: "break-word",
                                }}
                              >
                                {message.message && (
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap mb-1">
                                    {message.message}
                                  </p>
                                )}
                                {(message.pic_url ||
                                  message.doc_url ||
                                  message.video_url ||
                                  message.audio_url) && (
                                  <div className="mt-2 mb-1">
                                    {message.pic_url && (
                                      <a
                                        href={message.pic_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                      >
                                        <img
                                          src={message.pic_url}
                                          alt="Attachment"
                                          className="max-w-full h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                                          style={{ maxHeight: "200px" }}
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                              "block";
                                          }}
                                        />
                                        <div
                                          className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 text-center"
                                          style={{ display: "none" }}
                                        >
                                          📷 Image not available
                                        </div>
                                      </a>
                                    )}
                                    {(message.doc_url ||
                                      message.video_url ||
                                      message.audio_url) && (
                                      <a
                                        href={
                                          message.doc_url ||
                                          message.video_url ||
                                          message.audio_url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                                      >
                                        <span>
                                          {message.doc_url && "📄 Document"}
                                          {message.video_url && "🎥 Video"}
                                          {message.audio_url && "🔊 Audio"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          (Click to view)
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                )}
                                <div className="flex justify-end items-center gap-1 mt-1">
                                  <p className="text-xs text-gray-500">
                                    {formatMessageTime(message.edate)}
                                  </p>
                                  {isSent && (
                                    <span className="text-xs text-blue-500">
                                      ✓✓
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <FaWhatsapp className="text-4xl text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">
                          No messages found in selected date range
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your date filters
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </motion.div>
                </div>

                <div className="sticky bottom-0 bg-[#f0f0f0] border-t border-gray-200 p-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent resize-none text-sm"
                        rows="1"
                        style={{
                          minHeight: "48px",
                          maxHeight: "120px",
                          lineHeight: "1.4",
                        }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-[#008069] text-white rounded-full hover:bg-[#075e54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
                    >
                      <FiSend size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 bg-[#f8f9fa]">
                <FaWhatsapp className="text-6xl text-gray-300 mb-6" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Welcome to WhatsApp Web
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-md">
                  Select a conversation from the list to view messages and start
                  chatting
                </p>
                <div className="mt-8 text-xs text-gray-400 text-center">
                  <p>
                    Keep your phone connected to use WhatsApp on your computer.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Popup */}
      {selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto m-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#008069] flex items-center gap-2">
                <FaWhatsapp /> Message Details
              </h3>
              <button
                onClick={closeMessagePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.message || "N/A"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Sender</p>
                  <p className="text-gray-800">
                    {selectedMessage.sender || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Receiver</p>
                  <p className="text-gray-800">
                    {selectedMessage.receiver || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Date</p>
                  <p className="text-gray-800">
                    {selectedMessage.edate
                      ? new Date(selectedMessage.edate).toLocaleString(
                          "en-US",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Campaign</p>
                  <p className="text-gray-800">
                    {selectedMessage.campaignName || "Not assigned"}
                  </p>
                </div>
              </div>
              {(selectedMessage.pic_url ||
                selectedMessage.doc_url ||
                selectedMessage.video_url ||
                selectedMessage.audio_url) && (
                <div className="mt-4">
                  <p className="text-gray-500 font-medium mb-2">Attachment</p>
                  <a
                    href={
                      selectedMessage.pic_url ||
                      selectedMessage.doc_url ||
                      selectedMessage.video_url ||
                      selectedMessage.audio_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#008069] hover:bg-[#075e54] text-white rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeMessagePopup}
                className="px-4 py-2 bg-[#008069] text-white rounded-lg hover:bg-[#075e54] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {showAddToTask &&
        selectedDataID.lastMessage &&
        selectedDataID.lastMessage.dataID && (
          <AddToTask
            setClose={setShowAddToTask}
            dataID={selectedDataID.lastMessage.dataID}
            userID={userID}
            fetchData={fetchData}
          />
        )}
    </div>
  );
};

export default WhatsappReport;
