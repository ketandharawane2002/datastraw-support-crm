import { useEffect, useState } from "react"

const API_URL = "https://datastraw-support-crm-omhb.onrender.com"

function App() {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [ticketNotes, setTicketNotes] = useState([])

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
  })

  const [updateData, setUpdateData] = useState({
    status: "Open",
    note: "",
  })

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (search) {
        params.append("search", search)
      }

      if (status) {
        params.append("status", status)
      }

      const url = API_URL + "/api/tickets?" + params.toString()

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }

      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [search, status])

  // Handle create form input
  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Create new ticket
  const handleCreateTicket = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setMessage("")

      const response = await fetch(API_URL + "/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.detail || "Failed to create ticket"
        )
      }

      await response.json()

      setMessage("Ticket created successfully!")

      setFormData({
        customer_name: "",
        customer_email: "",
        subject: "",
        description: "",
      })

      await fetchTickets()

      setTimeout(() => {
        setShowForm(false)
        setMessage("")
      }, 1200)
    } catch (error) {
      console.error("Create ticket error:", error)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch notes/activity for selected ticket
  const fetchTicketNotes = async (ticketId) => {
    try {
      const response = await fetch(
        API_URL + "/api/tickets/" + ticketId + "/notes"
      )

      if (!response.ok) {
        throw new Error("Failed to fetch ticket notes")
      }

      const data = await response.json()
      setTicketNotes(data)
    } catch (error) {
      console.error("Notes fetch error:", error)
      setTicketNotes([])
    }
  }

  // View ticket details
  const handleViewTicket = async (ticketId) => {
    try {
      setLoading(true)
      setMessage("")
      setTicketNotes([])

      const response = await fetch(
        API_URL + "/api/tickets/" + ticketId
      )

      if (!response.ok) {
        throw new Error("Ticket not found")
      }

      const data = await response.json()

      setSelectedTicket(data)

      await fetchTicketNotes(ticketId)

      setUpdateData({
        status: data.status,
        note: "",
      })

      setShowDetails(true)
    } catch (error) {
      console.error("View ticket error:", error)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Update ticket status + internal note
  const handleUpdateTicket = async (event) => {
    event.preventDefault()

    if (!selectedTicket) {
      return
    }

    try {
      setLoading(true)
      setMessage("")

      const response = await fetch(
        API_URL + "/api/tickets/" + selectedTicket.ticket_id,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(
          errorData.detail || "Failed to update ticket"
        )
      }

      const updatedTicket = await response.json()

      setSelectedTicket(updatedTicket)

      await fetchTicketNotes(selectedTicket.ticket_id)

      setUpdateData({
        status: updatedTicket.status,
        note: "",
      })

      setMessage("Ticket updated successfully!")

      await fetchTickets()
    } catch (error) {
      console.error("Update ticket error:", error)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Status badge styling
  const getStatusClass = (ticketStatus) => {
    if (ticketStatus === "Open") {
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
    }

    if (ticketStatus === "In Progress") {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
    }

    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) {
      return "-"
    }

    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white shadow-sm">
              S
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Datastraw Support CRM
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Customer Support Ticket Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(true)
              setMessage("")
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            <span className="text-lg leading-none">+</span>
            <span>New Ticket</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Support Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monitor, search and manage customer support tickets.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Tickets
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                #
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {tickets.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current result set
            </p>
          </div>

          {/* Open */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Open
              </p>

              <div className="h-3 w-3 rounded-full bg-blue-500" />
            </div>

            <p className="mt-4 text-3xl font-bold text-blue-600">
              {
                tickets.filter(
                  (ticket) => ticket.status === "Open"
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Awaiting action
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                In Progress
              </p>

              <div className="h-3 w-3 rounded-full bg-amber-500" />
            </div>

            <p className="mt-4 text-3xl font-bold text-amber-600">
              {
                tickets.filter(
                  (ticket) => ticket.status === "In Progress"
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently being handled
            </p>
          </div>

          {/* Closed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Closed
              </p>

              <div className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>

            <p className="mt-4 text-3xl font-bold text-emerald-600">
              {
                tickets.filter(
                  (ticket) => ticket.status === "Closed"
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Resolved tickets
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">
              Find Tickets
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Search by customer, email, ticket ID, subject or description.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h3 className="font-semibold text-slate-900">
                All Tickets
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {tickets.length} ticket(s) found
              </p>
            </div>

            {loading && (
              <div className="text-xs font-medium text-slate-500">
                Updating...
              </div>
            )}
          </div>

          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                ?
              </div>

              <p className="mt-4 font-semibold text-slate-700">
                No tickets found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or create a new ticket.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6">
                      Ticket
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6">
                      Issue
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.ticket_id}
                      className="group transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-5 sm:px-6">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewTicket(ticket.ticket_id)
                          }
                          className="font-semibold text-slate-900 underline-offset-4 transition hover:text-slate-600 hover:underline"
                        >
                          {ticket.ticket_id}
                        </button>
                      </td>

                      <td className="px-5 py-5 sm:px-6">
                        <div className="font-medium text-slate-900">
                          {ticket.customer_name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {ticket.customer_email}
                        </div>
                      </td>

                      <td className="max-w-sm px-5 py-5 sm:px-6">
                        <div className="font-medium text-slate-800">
                          {ticket.subject}
                        </div>

                        <div className="mt-1 max-w-md truncate text-xs text-slate-500">
                          {ticket.description}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 sm:px-6">
                        <span
                          className={
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold " +
                            getStatusClass(ticket.status)
                          }
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {ticket.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-xs text-slate-500 sm:px-6">
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create New Ticket
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a customer support request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setMessage("")
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateTicket}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer Name
                </label>

                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Rahul Patil"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer Email
                </label>

                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  required
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Unable to login"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Describe the customer's issue..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {message && (
                <div
                  className={
                    "rounded-xl px-4 py-3 text-sm font-medium " +
                    (message.includes("successfully")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700")
                  }
                >
                  {message}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setMessage("")
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Details Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedTicket.ticket_id}
                  </h2>

                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold " +
                      getStatusClass(selectedTicket.status)
                    }
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {selectedTicket.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Ticket details and status management
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDetails(false)
                  setSelectedTicket(null)
                  setTicketNotes([])
                  setMessage("")
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Ticket Information */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Ticket Information
                  </h3>

                  <span className="text-xs text-slate-400">
                    {selectedTicket.ticket_id}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Customer Name
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedTicket.customer_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Customer Email
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedTicket.customer_email}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-slate-500">
                      Subject
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedTicket.subject}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-slate-500">
                      Description
                    </p>

                    <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Created At
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(selectedTicket.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(selectedTicket.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity & Notes */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      Activity & Notes
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Internal support activity for this ticket
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {ticketNotes.length} note
                    {ticketNotes.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {ticketNotes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                    <div className="text-2xl text-slate-300">
                      ○
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No activity yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Add an internal note below to start the activity history.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ticketNotes.map((note) => (
                      <div
                        key={note.id}
                        className="relative rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            N
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800">
                                Internal Note
                              </p>

                              <p className="text-xs text-slate-400">
                                {formatDate(note.created_at)}
                              </p>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                              {note.note_text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Update Ticket */}
              <form
                onSubmit={handleUpdateTicket}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Update Ticket
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      value={updateData.status}
                      onChange={(event) =>
                        setUpdateData((previous) => ({
                          ...previous,
                          status: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">
                        In Progress
                      </option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Internal Note
                    </label>

                    <textarea
                      value={updateData.note}
                      onChange={(event) =>
                        setUpdateData((previous) => ({
                          ...previous,
                          note: event.target.value,
                        }))
                      }
                      rows="4"
                      placeholder="Add an internal support note..."
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  {message && (
                    <div
                      className={
                        "rounded-xl px-4 py-3 text-sm font-medium " +
                        (message.includes("successfully")
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700")
                      }
                    >
                      {message}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetails(false)
                        setSelectedTicket(null)
                        setTicketNotes([])
                        setMessage("")
                      }}
                      className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Close
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App