"use client";

import React, { useState } from "react";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Danh sách nhóm công việc và công việc con ban đầu
const initialTaskGroups = [
  {
    id: 1,
    name: "Công việc văn phòng",
    tasks: [
      { id: 101, title: "Họp nhóm" },
      { id: 102, title: "Viết báo cáo" },
      { id: 103, title: "Đọc email" },
    ],
  },
  {
    id: 2,
    name: "Công việc khách hàng",
    tasks: [
      { id: 201, title: "Gọi điện cho khách hàng" },
      { id: 202, title: "Chuẩn bị bài thuyết trình" },
      { id: 203, title: "Gặp gỡ khách hàng" },
    ],
  },
  {
    id: 3,
    name: "Phát triển cá nhân",
    tasks: [
      { id: 301, title: "Đọc sách" },
      { id: 302, title: "Tập thể dục" },
      { id: 303, title: "Học kỹ năng mới" },
    ],
  },
];

type SlotInfo = { start: Date; end: Date };
type Event = {
  id?: string;
  title: string;
  start: Date;
  end: Date;
};
export function ScheduleManagerComponent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [taskGroups, setTaskGroups] = useState(initialTaskGroups);
  const [newGroup, setNewGroup] = useState<{ name: string; tasks: string[] }>({ name: "", tasks: [] });
  const [newTask, setNewTask] = useState("");

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setNewEvent({
      title: "",
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setSelectedGroup("");
    setSelectedTask("");
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    let eventTitle = newEvent.title;
    if (selectedTask) {
      const group = taskGroups.find((g) => g.id.toString() === selectedGroup);
      if (group) {
        const task = group.tasks.find((t) => t.id.toString() === selectedTask);
        if (task) {
          eventTitle = task.title;
        }
      }
    }
    const eventToAdd = {
      ...newEvent,
      title: eventTitle,
    };
    setEvents([...events, eventToAdd]);
    setIsModalOpen(false);
    setNewEvent({
      title: "",
      start: new Date(),
      end: new Date(),
    });
    setSelectedGroup("");
    setSelectedTask("");
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleSelectEvent = (event: {
    id?: string;
    title: string;
    start: Date;
    end: Date;
  }) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEditEvent = () => {
    if (editingEvent) {
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? editingEvent : event
      );
      setEvents(updatedEvents.filter((event): event is Event => event !== null));
    }
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    const updatedEvents = events.filter(
      (event) => editingEvent && event.id !== editingEvent.id
    );
    setEvents(updatedEvents);
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleAddNewGroup = () => {
    if (newGroup.name && newGroup.tasks.length > 0) {
      const newGroupId = Math.max(...taskGroups.map((g) => g.id)) + 1;
      const newTaskGroup = {
        id: newGroupId,
        name: newGroup.name,
        tasks: newGroup.tasks.map((task, index) => ({
          id: newGroupId * 100 + index + 1,
          title: task,
        })),
      };
      setTaskGroups([...taskGroups, newTaskGroup]);
      setNewGroup({ name: "", tasks: [] });
      setIsNewGroupModalOpen(false);
    }
  };

  const handleAddTaskToNewGroup = () => {
    if (newTask) {
      setNewGroup({
        ...newGroup,
        tasks: [...newGroup.tasks, newTask],
      });
      setNewTask("");
    }
  };

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Lịch Làm Việc Cá Nhân</h1>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-2 sm:mb-0">
          <Button
            onClick={() => setView(Views.MONTH)}
            className="mr-2 mb-2 sm:mb-0"
          >
            Xem Tháng
          </Button>
          <Button onClick={() => setView(Views.DAY)}>Xem Ngày</Button>
        </div>
        <Button
          onClick={() => setIsNewGroupModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Thêm Nhóm Mới
        </Button>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 200px)" }}
        className="min-h-[300px]"
        selectable
        onSelectSlot={handleSelectSlot}
        view={view}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        date={date}
        onSelectEvent={handleSelectEvent}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Công Việc Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="sm:text-right">
                Chọn nhóm công việc
              </Label>
              <Select
                value={selectedGroup}
                onValueChange={(value) => {
                  setSelectedGroup(value);
                  setSelectedTask("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm công việc" />
                </SelectTrigger>
                <SelectContent>
                  {taskGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedGroup && (
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="task" className="sm:text-right">
                  Chọn công việc
                </Label>
                <Select
                  value={selectedTask}
                  onValueChange={setSelectedTask}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn công việc" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskGroups
                      .find((g) => g.id.toString() === selectedGroup)
                      ?.tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="sm:text-right">
                Hoặc nhập tiêu đề mới
              </Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="col-span-1 sm:col-span-3"
                disabled={selectedTask !== ""}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="start" className="sm:text-right">
                Bắt đầu
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: new Date(e.target.value) })
                }
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="end" className="sm:text-right">
                Kết thúc
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: new Date(e.target.value) })
                }
                className="col-span-1 sm:col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddEvent} className="w-full sm:w-auto">
              Thêm Công Việc
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Công Việc</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="editTitle" className="sm:text-right">
                Tiêu đề
              </Label>
              <Input
                id="editTitle"
                value={editingEvent?.title || ""}
                onChange={(e) =>
                  setEditingEvent(editingEvent ? { ...editingEvent, title: e.target.value } : null)
                }
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="editStart" className="sm:text-right">
                Bắt đầu
              </Label>
              <Input
                id="editStart"
                type="datetime-local"
                value={moment(editingEvent?.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setEditingEvent(editingEvent ? {
                    ...editingEvent,
                    start: new Date(e.target.value),
                  } : null)
                }
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="editEnd" className="sm:text-right">
                Kết thúc
              </Label>
              <Input
                id="editEnd"
                type="datetime-local"
                value={moment(editingEvent?.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setEditingEvent(editingEvent ? {
                    ...editingEvent,
                    end: new Date(e.target.value),
                  } : null)
                }
                className="col-span-1 sm:col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button onClick={handleDeleteEvent} variant="destructive">
              Xóa
            </Button>
            <Button onClick={handleEditEvent}>Lưu Thay Đổi</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewGroupModalOpen} onOpenChange={setIsNewGroupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Nhóm Công Việc Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupName" className="text-right">
                Tên nhóm
              </Label>
              <Input
                id="groupName"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTask" className="text-right">
                Thêm công việc
              </Label>
              <div className="col-span-3 flex">
                <Input
                  id="newTask"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleAddTaskToNewGroup} className="ml-2">
                  Thêm
                </Button>
              </div>
            </div>
            {newGroup.tasks.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Công việc đã thêm</Label>
                <ul className="col-span-3 list-disc pl-5">
                  {newGroup.tasks.map((task, index) => (
                    <li key={index}>{task}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddNewGroup}>Tạo Nhóm Mới</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
