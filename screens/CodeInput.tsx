import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export interface CodeInputScreenProps {
  codeLength?: number;
  code: string;
  onCodeChange: (code: string) => void;
}
export default function CodeInputScreen({
  codeLength = 9,
  code,
  onCodeChange,
}: CodeInputScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-900">
      <InputOTP
        maxLength={9}
        value={code.toUpperCase()}
        onChange={onCodeChange}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={6} />
          <InputOTPSlot index={7} />
          <InputOTPSlot index={8} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
