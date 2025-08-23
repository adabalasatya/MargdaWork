"use client"
import SendEmailCon from "@/app/(dashboard)/(DataComponents)/SendEmailCon/page";
import WhatsAppCon from "@/app/(dashboard)/(DataComponents)/SendWhatsappCon/page";
import CallCon from "@/app/(dashboard)/(DataComponents)/SendCallCon/page";
import SendSmsCon from "@/app/(dashboard)/(DataComponents)/SendSmsCon/page";

const CommunicationModals = ({
  showEmailSend,
  setShowEmailSend,
  showWhatsappSend,
  setShowSendWhatsapp,
  showCallSend,
  setShowCallSend,
  showSmsSend,
  setShowSmsSend,
  selectedRows,
  setSelectedRows,
  userID,
  fetchData,
}) => {
  return (
    <>
      {/* Email Send Modal */}
      {showEmailSend && (
        <SendEmailCon
          setSendEmail={setShowEmailSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* WhatsApp Send Modal */}
      {showWhatsappSend && (
        <WhatsAppCon
          setClose={setShowSendWhatsapp}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* Call Send Modal */}
      {showCallSend && (
        <CallCon
          setShowCallCon={setShowCallSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          fetchData={() => fetchData(userID)}
        />
      )}

      {/* SMS Send Modal */}
      {showSmsSend && (
        <SendSmsCon
          setClose={setShowSmsSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}
    </>
  );
};

export default CommunicationModals;
