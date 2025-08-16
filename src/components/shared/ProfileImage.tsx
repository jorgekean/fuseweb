import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { AccountInfo, InteractionRequiredAuthError } from "@azure/msal-browser";
import { FaUserCircle } from "react-icons/fa";

interface ProfileImageProps {
    className?: string | undefined;
    alt?: string | undefined;
    style?: React.CSSProperties | undefined;
    loading?: "eager" | "lazy" | undefined;
}

const ProfileImage = ({
    className = "",
    alt = "Profile Image",
    style,
    loading = "lazy",
}: ProfileImageProps) => {
    const { instance, accounts } = useMsal();
    const [imageUrl, setImageUrl] = useState("");

    const getToken = async () => {
        const graphRequest = {
            scopes: ["User.ReadBasic.All"],
            account: accounts[0],
        };
        try {
            const response = await instance.acquireTokenSilent(graphRequest);
            return response.accessToken;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                console.log(
                    "Silent token acquisition failed. Initiating interactive flow..."
                );
                const loginRequest = {
                    scopes: ["User.ReadBasic.All"],
                };
                await instance.acquireTokenRedirect(loginRequest);
            } else {
                throw error;
            }
        }
    };

    const fetchProfileImage = async () => {
        try {
            const token = await getToken();
            const headers = new Headers();
            const bearer = `Bearer ${token}`;
            headers.append("Authorization", bearer);
            const options = {
                method: "GET",
                headers: headers,
            };
            const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${accounts[0].username}/photo/$value`;
            const response = await fetch(graphEndpoint, options);

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            } else {
                console.error("Failed to fetch profile image");
                setImageUrl("");
            }
        } catch (error) {
            console.error("Error fetching profile image", error);
        }
    };

    useEffect(() => {
        if (accounts.length > 0) {
            fetchProfileImage();
        }
    }, [accounts]);

    const userInfo = accounts[0] || {};

    return (
        <div className="relative inline-block group">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    className={`rounded-full cursor-pointer ${className}`}
                    alt={alt}
                    style={style}
                    loading={loading}
                />
            ) : (
                <FaUserCircle
                    className="text-gray-600 cursor-pointer"
                    size={32}
                />
            )}

            <div className="z-50 absolute transform translate-x-[-100%] mt-2 hidden group-hover:block bg-white border border-gray-300 shadow-lg rounded-lg p-4 w-64">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                    {userInfo.name || "Name not available"}
                </p>
                <p className="text-xs text-gray-600">
                    {userInfo.username || "Email not available"}
                </p>
            </div>
        </div>
    );
};

export default ProfileImage;
