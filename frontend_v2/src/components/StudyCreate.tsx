import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, X, BookOpen } from 'lucide-react';
import { User } from '../App';
import { KOREA_REGIONS } from './MainDashboard';
import { STUDY_SUBJECTS } from '../utils/subjects';
import { toast } from 'sonner@2.0.3';

interface StudyCreateProps {
  user: User;
  onBack: () => void;
}

export function StudyCreate({ user, onBack }: StudyCreateProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    tags: [] as string[],
    type: '' as 'online' | 'offline' | '',
    sido: '',
    sigungu: '',
    dongEupMyeon: '',
    duration: '' as 'short' | 'long' | '',
    maxMembers: 6,
    startDate: '',
    endDate: '',
    weekDuration: '',
    dayDuration: ''
  });
  
  const [newTag, setNewTag] = useState('');
  const [availableSigungu, setAvailableSigungu] = useState<string[]>([]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSidoChange = (sido: string) => {
    setFormData(prev => ({
      ...prev,
      sido,
      sigungu: '',
      dongEupMyeon: ''
    }));
    setAvailableSigungu(KOREA_REGIONS[sido as keyof typeof KOREA_REGIONS] || []);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.subject || !formData.description) {
      toast.error('필수 정보를 모두 입력해주세요');
      return;
    }

    if (!formData.type) {
      toast.error('진행 방식을 선택해주세요');
      return;
    }

    if (formData.type === 'offline' && (!formData.sido || !formData.sigungu || !formData.dongEupMyeon)) {
      toast.error('지역 정보를 모두 입력해주세요');
      return;
    }

    if (!formData.duration || !formData.startDate || !formData.endDate) {
      toast.error('진행 기간 정보를 모두 입력해주세요');
      return;
    }
    
    // Mock study creation
    console.log('Creating study:', formData);
    
    toast.success('스터디가 성공적으로 생성되었습니다!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2 flex-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-medium">스터디 만들기</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
              <CardDescription>스터디의 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">스터디 이름 *</Label>
                <Input
                  id="name"
                  placeholder="예: 토익 900점 달성하기"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">주제 *</Label>
                <Select onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="주제를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_SUBJECTS.map(subject => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명 *</Label>
                <Textarea
                  id="description"
                  placeholder="스터디에 대한 자세한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>태그 (최대 5개)</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="태그 입력 후 추가 버튼 클릭"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm pr-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0.5 hover:bg-destructive/20"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">장소 및 방식</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>진행 방식 *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="offline" id="offline" />
                    <Label htmlFor="offline">오프라인 (대면)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">온라인 (비대면)</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.type === 'offline' && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="sido">시/도 *</Label>
                    <Select value={formData.sido} onValueChange={handleSidoChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="시/도를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(KOREA_REGIONS).map(sido => (
                          <SelectItem key={sido} value={sido}>{sido}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.sido && (
                    <div className="space-y-2">
                      <Label htmlFor="sigungu">시/군/구 *</Label>
                      <Select value={formData.sigungu} onValueChange={(value) => handleInputChange('sigungu', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="시/군/구를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSigungu.map(sigungu => (
                            <SelectItem key={sigungu} value={sigungu}>{sigungu}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.sigungu && (
                    <div className="space-y-2">
                      <Label htmlFor="dongEupMyeon">동/읍/면 *</Label>
                      <Input
                        id="dongEupMyeon"
                        placeholder="동/읍/면을 입력하세요 (예: 역삼동)"
                        value={formData.dongEupMyeon}
                        onChange={(e) => handleInputChange('dongEupMyeon', e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxMembers">최대 인원</Label>
                <Select 
                  value={formData.maxMembers.toString()} 
                  onValueChange={(value) => handleInputChange('maxMembers', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num}명</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">진행 기간</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>기간 유형 *</Label>
                <RadioGroup
                  value={formData.duration}
                  onValueChange={(value) => handleInputChange('duration', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="short" />
                    <Label htmlFor="short">단기 (12주 이하, 진행률 관리)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="long" />
                    <Label htmlFor="long">장기 (12주 초과, 지속적 학습)</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.duration === 'short' && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    단기 스터디는 주 단위 또는 일 단위로 기간을 설정할 수 있습니다.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekDuration">주 단위 기간</Label>
                      <Select onValueChange={(value) => handleInputChange('weekDuration', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="주 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                            <SelectItem key={week} value={week.toString()}>{week}주</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dayDuration">또는 일 단위</Label>
                      <Select onValueChange={(value) => handleInputChange('dayDuration', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="일 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {[7, 14, 21, 30, 45, 60, 90].map((day) => (
                            <SelectItem key={day} value={day.toString()}>{day}일</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">종료일 *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Info Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">스터디장 정보</CardTitle>
              <CardDescription>자동으로 표시됩니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">
                    {user.nickname.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.nickname}</p>
                  <p className="text-sm text-muted-foreground">{user.gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="sticky bottom-0 bg-background p-4 border-t -mx-4">
            <Button type="submit" className="w-full" size="lg">
              스터디 만들기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
