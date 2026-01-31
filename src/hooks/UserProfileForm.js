import { useState, useEffect } from "react";
import axios from "axios";

/**
 * useProfileForm 커스텀 훅
 * 
 * 프로필 수정에 필요한 모든 상태들과 처리 로직을 관리하는 커스텀 훅
 * - 프로필 정보 로딩 
 * - 폼 데이터 관리
 * - 이미지 업로드 
 * - 폼 데이터 submit
 * 
 * @param{
 * JWT 억세스 토큰, 사용자 로그인 후 받아오는 토큰 정보
 * } accessToken
 * 
 * @returns {object} 프로필 폼 관련 상태 및 함수들을 반환
 * 
*/
export function useProfileForm(accessToken) {

    // 폼 데이터 (백엔드 api로부터 불러옴) 
    const [formData, setFormData] = useState({
        userId: '',
        email: '',
        name: '',
        profileImage: '',
        provider: '',
        userProfileId: '',
        lastName: '',
        firstName: '',
        phoneNumber: '',
        address1: '',
        address2: '',
        bgImage: '',
        createdAt: ''
    });

    // 이미지 state
    const [previewImage, setPreviewImage] = useState(null);
    const [previewBackground,setPreviewBackground] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedBackgroundFile,setSelectedBackgroundFile] = useState(null);

    // UI 상태(에러, 로딩중, submit중..)
    const [errors, setErrors] = useState({}) // 하번에 여러개의 에러가 있을수 있으므로 객체의 형태로 정의
    const [isLoading, setIsLoading] =useState(false); //submit
    const [isLoadingProfile,setIsLoadingProfile] = useState(true);

    // 페이지 로딩 후 바로 실행될 처리
    useEffect(()=>{
        // 사용자의 기본 프로필 정보 로딩...
        const loadProfile = async () => {
            if(!accessToken) {
                // accessToken이 없다면 로그인되지 않은 상태이므로 빠져나감
                setIsLoadingProfile(false);
                return;
            }

            try {
                // Back-end의 Get/ suer profile 정보를 요청한다
                const response = await axios.get('/api/user/profile', {
                    headers : {'Authorization': `Bearer ${accessToken}`},
                    withCredentials: true
                });

                console.log(response.data.data)

                // 사용자 프로필 정보를 정상적으로 로드했다면...
                if (response.data.data) {
                    const data =response.data.data;

                    // 이미지 url tjfwjd
                    if (data.profileImage) setPreviewImage(data.profileImage);
                    if (data.bgImage) setPreviewBackground(data.bgImage);

                    // 폼에 수정할(또는 보여줄) 데이터 설정
                    setFormData(({
                        email: data.email || '',
                        name: data.name || '',
                        provider: data.provider || '',
                        lastName: data.lastName || '',
                        firstName: data.firstName || '',
                        phoneNumber: data.phoneNumber || '',
                        address1: data.address1 || '',
                        address2: data.address2 || ''
                      }));
                      

                    console.log("사용자 이메일: ", formData.email);
                    console.log("프로필 이미지: ", formData.profileImage);
                }
            } catch (error){
                console.log('프로필 조회 실패: ', error);
            } finally {
                setIsLoadingProfile(false);
            }

        }

        loadProfile();
    }, [accessToken]);

    // 데이터 입력시 상태와 연동하여 상태값 변경
    const handleChange = (e) => {
        const {name, value} = e. target;
        setFormData(prev => ({...prev, [name]:value}));

        // 에러 초기화 
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]:''}))
        };
    };

    const validateForm = () => {
        const newErrors = {};

        // 닉네임 필수 검사
        if (!formData.name?.trim()) {
            newErrors.name = '닉네임을 입력해주세요';
        }

        // 각각의 항목들의 입력값들을 검증해본다...

        // 에러 설정 
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const submitProfile = async () => {

        // 폼 데이터 체크하기
        if (!validateForm()) return false;

        setIsLoading(true);

        try {
            let profileImageUrl = previewImage;
            let bgImageUrl = previewBackground;

            // 이미지 업로드 API 호출을 2번(profileImage, BackgrountImage)
            if (selectedFile) {
                const uploadeUrl = await uploadImage(selectedFile);
                if (uploadeUrl) profileImageUrl = uploadeUrl;
            }

            if (selectedBackgroundFile) {
                const uploadeUrl = await uploadImage(selectedBackgroundFile);
                if (uploadeUrl) bgImageUrl = uploadeUrl;
            }

            if (profileImageUrl?.startsWith('data:')) profileImageUrl = null;
            if (bgImageUrl?.startsWith('data:')) bgImageUrl = null;

            // requst Data 구성하기 
            const requstData = {
                name: formData.name,
                profileImage: profileImageUrl,
                lastName: formData.lastName,
                firstName: formData.firstName,
                phoneNumber: formData.phoneNumber,
                address1: formData.address1,
                address2: formData.address2,
                bgImage: bgImageUrl
            };

            // 백엔드 API 호출
            const response = await axios.put('/api/user/profile', requstData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            })

            return response.data.success || response.status === 200;

        } catch (error) {
            console.log("프로필 수정 실패:", error);
            throw error;

        } finally {
            setIsLoading(false);
        }

    }

    // 이미지 처리 함수
    const handleImageSelect = (file, type) => {
        if (!file) return false;

        // 이미지 파일 유효성 검사
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택 가능합니다');
            return false;
        }

        const maxSize = 1024 * 1024 * 2;
        if (file.size > maxSize){
            alert('파일 크기는 2MB 이하여야 합니다.');
            return false;
        }

        // 파일 저장 및 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            if(type==='profile') {
                setSelectedFile(file);
                setPreviewImage(reader.result);
            } else {
                setSelectedBackgroundFile(file);
                setPreviewBackground(reader.result);
            }
        }
        reader.readAsDataURL(file);

        return true;
    };

    // 이미지 업로드
    const uploadImage = async (file) => {
        if(!file) return null;

        const uploadFormData = new FormData();
        uploadFormData.append('file',file);

        try {
            const response = await axios.post('/api/upload/image', uploadFormData,{
                headers: {'Authorization': `Berer $(accessToken)`},
                withCredentials: true
            });

            return response.data?.data?.imageUrl || null;
        } catch (error) {
            console.log('이미지 업로드 실패: ', error);
            return null;
        }
    };

    // 반환값 정의
    return {
        // 상태 
        formData,
        errors,
        isLoading,
        isLoadingProfile,
        previewImage,
        previewBackground,

        // 핸들러
        handleChange,
        submitProfile,
        handleImageSelect,
        uploadImage
    };

}