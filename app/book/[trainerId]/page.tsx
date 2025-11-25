import { Share2 } from "lucide-react"
import Link from "next/link"

// ... (keep existing imports)

export default function PublicBookingPage() {
  // ... (keep existing state)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Profile link copied to clipboard!")
  }

  // ... (keep existing effects)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Trainer Header */}
        <Card className="mb-8 p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <img src={trainer.image || "/placeholder-avatar.png"} alt={trainer.name} className="object-cover" />
            </Avatar>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{trainer.name}</h1>
                  <p className="text-lg text-gray-600 mb-6 max-w-2xl">{trainer.bio}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 hidden md:flex" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Share Profile
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <MapPin className="h-4 w-4 text-green-600" />
                  {trainer.location || "Remote"}
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-900">${trainer.hourlyRate}</span>/{terms.session.toLowerCase()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {trainer.specialties?.map((specialty, idx) => (
                  <span key={idx} className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="absolute top-4 right-4 md:hidden" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Select a {terms.session}
            </h2>
            <div className="space-y-4">
              {services.length === 0 ? (
                <Card className="p-8 text-center text-gray-500 border-dashed">
                  <p>No {terms.sessions.toLowerCase()} available yet.</p>
                  <p className="text-sm mt-2">Contact {trainer.name} directly to book.</p>
                </Card>
              ) : (
                services.map((service) => (
                  <Card
                    key={service.id}
                    className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedService === service.id
                        ? "border-green-500 border-2 bg-green-50/50 shadow-md ring-1 ring-green-500/20"
                        : "hover:border-green-200 border-transparent"
                      }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                      <span className="text-xl font-bold text-green-600">${service.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-2 py-1 rounded-md border">
                        <Clock className="h-3.5 w-3.5" />
                        {service.duration} mins
                      </div>
                      {selectedService === service.id && (
                        <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                          <Check className="h-4 w-4" />
                          Selected
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Choose Date & Time
            </h2>
            <Card className="p-6 mb-6 border-none shadow-lg">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md flex justify-center"
                disabled={(date) => date < new Date()}
                classNames={{
                  head_cell: "text-gray-500 font-normal text-[0.8rem]",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-green-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                  day_selected: "bg-green-600 text-white hover:bg-green-600 hover:text-white focus:bg-green-600 focus:text-white",
                  day_today: "bg-gray-100 text-gray-900",
                }}
              />
            </Card>

            {selectedDate && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  Available Times
                  <span className="text-sm font-normal text-gray-500">
                    for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </h3>
                {loadingTimes ? (
                  <div className="flex justify-center py-12 bg-white rounded-lg border border-dashed">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : availableTimes.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500 border-dashed bg-gray-50/50">
                    <p>No times available on this day.</p>
                    <p className="text-sm mt-2">Please select another date.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={`h-12 transition-all ${selectedTime === time
                            ? "bg-green-600 hover:bg-green-700 shadow-md scale-105"
                            : "hover:border-green-300 hover:bg-green-50"
                          }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedService && selectedDate && selectedTime && (
              <div className="sticky bottom-6 mt-8 animate-in fade-in slide-in-from-bottom-8">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 rounded-xl"
                  onClick={handleBooking}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{terms.book}</span>
                    <span className="text-xs font-normal opacity-90">
                      {selectedDate.toLocaleDateString()} at {selectedTime}
                    </span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Powered By Footer */}
        <div className="mt-20 text-center pb-8">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors group"
          >
            <span className="text-sm font-medium">Powered by</span>
            <span className="font-bold text-gray-600 group-hover:text-green-700">GoodRunss .G0</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
