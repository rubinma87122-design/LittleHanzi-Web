#import <React/RCTBridgeModule.h>
#import <AVFoundation/AVFoundation.h>

@interface AVSpeechModule : NSObject <RCTBridgeModule>
@end

@implementation AVSpeechModule

RCT_EXPORT_MODULE(AVSpeechModule);

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(speak:(NSString *)text options:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  AVSpeechUtterance *utterance = [[AVSpeechUtterance alloc] initWithString:text];

  // 设置语速
  if (options[@"rate"]) {
    utterance.rate = [options[@"rate"] floatValue];
  } else {
    utterance.rate = 0.5; // 默认较慢的语速
  }

  // 设置音调
  if (options[@"pitch"]) {
    utterance.pitchMultiplier = [options[@"pitch"] floatValue];
  } else {
    utterance.pitchMultiplier = 1.0;
  }

  // 设置音量
  if (options[@"volume"]) {
    utterance.volume = [options[@"volume"] floatValue];
  } else {
    utterance.volume = 1.0;
  }

  // 设置语言
  if (options[@"language"]) {
    utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:options[@"language"]];
  } else {
    utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"zh-CN"];
  }

  AVSpeechSynthesizer *synthesizer = [[AVSpeechSynthesizer alloc] init];
  [synthesizer speakUtterance:utterance];

  resolve(nil);
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(nil);
}

RCT_EXPORT_METHOD(pause:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(nil);
}

RCT_EXPORT_METHOD(resume:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(nil);
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end