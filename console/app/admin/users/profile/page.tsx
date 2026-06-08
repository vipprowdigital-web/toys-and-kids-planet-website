"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const [tab, setTab] = useState("basicinfo");

  const [user, setUser] = useState({
    name: "Full Name",
    email: "email@example.com",
    avatar: "/avatars/default.jpg",
    about: "Full Stack Developer passionate about React, Node, and Laravel.",
    linkedin: "",
    github: "",
    twitter: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Updated User:", user);
    // 👉 TODO: send PATCH request to backend
  };

  return (
    <div className="flex min-h-screen bg-muted/30 p-6 md:p-10">
      <Card className="w-full max-w-6xl mx-auto flex overflow-hidden rounded-2xl shadow-sm border">
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex flex-col md:flex-row w-full"
        >
          {/* LEFT SIDE TABS */}
          <div className="w-full md:w-1/4 border-r bg-background">
            <TabsList className="flex flex-col w-full p-3 gap-2">
              <TabsTrigger
                value="basicinfo"
                className={`justify-start ${tab === "basicinfo" ? "bg-muted" : ""}`}
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="about-me"
                className={`justify-start ${tab === "about-me" ? "bg-muted" : ""}`}
              >
                About Me
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className={`justify-start ${tab === "accounts" ? "bg-muted" : ""}`}
              >
                Accounts
              </TabsTrigger>
            </TabsList>
          </div>

          {/* RIGHT SIDE CONTENT */}
          <div className="flex-1 p-6">
            {/* BASIC INFO TAB */}
            <TabsContent value="basicinfo">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={user.avatar}
                    onChange={handleChange}
                    placeholder="Enter avatar image URL"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardFooter>
            </TabsContent>

            {/* ABOUT ME TAB */}
            <TabsContent value="about-me">
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="about">Bio</Label>
                <Textarea
                  id="about"
                  name="about"
                  rows={6}
                  value={user.about}
                  onChange={handleChange}
                  placeholder="Tell us something about yourself..."
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Bio</Button>
              </CardFooter>
            </TabsContent>

            {/* ACCOUNTS TAB */}
            <TabsContent value="accounts">
              <CardHeader>
                <CardTitle>Social Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={user.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    name="github"
                    value={user.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={user.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Accounts</Button>
              </CardFooter>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
