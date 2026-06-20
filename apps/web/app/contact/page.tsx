import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Contact us</h1>
          <p className="mt-3 text-muted-foreground">
            Questions about products, shipping, returns, or wholesale? Send a message and the team will respond.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <p className="flex items-center gap-3"><Mail className="h-4 w-4" /> support@toolboxbd.com</p>
            <p className="flex items-center gap-3"><Phone className="h-4 w-4" /> +880 1700 000000</p>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4" /> Dhaka, Bangladesh</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <Input placeholder="Your name" />
              <Input type="email" placeholder="Email address" />
              <Input placeholder="Subject" />
              <Textarea placeholder="How can we help?" />
              <Button type="submit">Submit message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
