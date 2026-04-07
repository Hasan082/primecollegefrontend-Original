import {
  Users, Award, CheckCircle, Shield, BookOpen, Target, Heart,
  Star, Lightbulb, TrendingUp, Globe, Zap, Clock, ThumbsUp,
  Layers, Briefcase, Smile, GraduationCap, Building, Rocket, Megaphone,
} from "lucide-react";
import React from "react";

export const iconMap: Record<string, React.ElementType> = {
  Users, Award, CheckCircle, Shield, BookOpen, Target, Heart,
  Star, Lightbulb, TrendingUp, Globe, Zap, Clock, ThumbsUp,
  Layers, Briefcase, Smile, GraduationCap, Building, Rocket, Megaphone,
};

export const getImageUrl = (image: any): string => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.original || image.large || image.medium || image.small || "";
};
